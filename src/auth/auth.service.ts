import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { SigninDto, SignupDto } from './dto';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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
          lastName: dto.lastName,
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

  async signin(dto: SigninDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // if user does not exist throw ex
    if (!user) throw new ForbiddenException('Credentials incorrect!');

    // compare passwords
    const passwordMatch = await argon.verify(user.hash, dto.password);
    if (!passwordMatch) throw new ForbiddenException('Credentials incorrect!');
    delete user.hash;
    return user;
  }
}
