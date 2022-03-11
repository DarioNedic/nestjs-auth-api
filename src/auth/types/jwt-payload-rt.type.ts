import { JwtPayload } from './jwt-payload.type';

export type JwtPayloadRt = JwtPayload & { refresh_token: string };
