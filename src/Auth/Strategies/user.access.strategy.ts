import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import config from '../../Config';
import UserRepository from '../../Repository/User/user.repository';

@Injectable()
export default class UserAccessStrategy extends PassportStrategy(Strategy, 'user') {
  constructor(private userRepository: UserRepository) {
    super({
      secretOrKey: config.jwt.secret_key,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any): Promise<object> {
    const user = await this.userRepository.getUserByEmail(payload.email);

    if (!user) {
      throw new NotFoundException();
    }

    if (user.isApproved()) {
      return {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
      };
    }

    throw new UnauthorizedException(
      'Your account has not been approved, please wait while our site admin reviews your application request.',
    );
  }
}
