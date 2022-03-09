import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login() {
    return { msg: 'TODO Login' };
  }

  register() {
    return { msg: 'TODO Register' };
  }
}
