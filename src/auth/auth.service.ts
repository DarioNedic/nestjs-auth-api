import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(authDto: AuthDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(authDto.password);
      // save the new user in db
      const user = await this.prisma.user.create({
        data: {
          email: authDto.email,
          hash,
          username: authDto.username,
          firstName: authDto.firstName,
          lastName: authDto.lastName,
        },
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

  login() {
    return { msg: 'TODO Login' };
  }
}
