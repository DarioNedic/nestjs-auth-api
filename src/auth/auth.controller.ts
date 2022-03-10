import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prismaService: PrismaService,
  ) {}

  @Post('register')
  register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto);
  }

  @Post('login')
  login() {
    return this.authService.login();
  }
}
