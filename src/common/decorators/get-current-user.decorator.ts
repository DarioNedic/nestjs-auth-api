import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadRt } from 'src/auth/types';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadRt | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  }
);
