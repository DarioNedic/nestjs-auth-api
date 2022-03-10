import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to POS NestJS app! Go to /api for Swagger docs';
  }
}
