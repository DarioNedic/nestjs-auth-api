import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { SigninDto, SignupDto } from './dto';
import { Token } from './types';
@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  async signup(dto: SignupDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password);

      // save the new user in db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          username: dto.username,
          firstName: dto.firstName,
          lastName: dto.lastName
        }
      });

      // return the saved user
      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
    }
  }

  async signin(dto: SigninDto): Promise<Token> {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    });

    // if user does not exist throw ex
    if (!user) throw new ForbiddenException('Credentials incorrect!');

    // compare passwords
    const passwordMatch = await argon.verify(user.hash, dto.password);
    if (!passwordMatch) throw new ForbiddenException('Credentials incorrect!');

    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async refreshTokens(userId: number, rt: string): Promise<Token> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied!');

    const rtMatches = await argon.verify(user.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied!');

    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: number) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null
        }
      },
      data: {
        hashedRt: null
      }
    });
  }

  async getTokens(user: User): Promise<Token> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    };
    // creating access token
    const at = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('ACCESS_TOKEN_EXPIRATION'),
      secret: this.config.get('ACCESS_TOKEN_SECRET')
    });
    // creating refresh token
    const rt = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('REFRESH_TOKEN_EXPIRATION'),
      secret: this.config.get('REFRESH_TOKEN_SECRET')
    });
    //a new entry in token db

    return {
      access_token: at,
      refresh_token: rt
    };
  }

  async updateRefreshToken(userId: number, rt: string): Promise<void> {
    const hash = await argon.hash(rt);
    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        hashedRt: hash
      }
    });
  }
}
