import { JwtPayload } from './jwt-payload.type';

export type JwtPayloadRt = JwtPayload & { refreshToken: string };
