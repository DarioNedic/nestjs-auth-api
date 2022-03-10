import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prismaService: PrismaService,
  ) {}

  @Post('register')
  register() {
    return this.authService.login();
  }

  @Post('login')
  login() {
    return this.authService.register();
  }
}
