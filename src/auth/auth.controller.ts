import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }
}
