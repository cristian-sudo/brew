import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import config from '../../Config';

@Injectable()
export default class AdminAccessStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor() {
    super({
      secretOrKey: config.jwt.secret_key,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any): Promise<object> {
    if (payload.roles.includes('ROLE_ADMIN')) {
      return {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
      };
    }
    throw new UnauthorizedException();
  }
}
