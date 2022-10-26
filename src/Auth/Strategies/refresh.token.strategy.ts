import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { EntityManager } from '@mikro-orm/mysql';
import { Loaded } from '@mikro-orm/core';
import TokenHandler from '../Jwt/token.handler';
import RefreshToken from '../../Entity/User/Token/refresh.token.entity';

@Injectable()
export default class AdminAccessStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private jwtService: JwtService,
    private tokenHandler: TokenHandler,
    private em: EntityManager,
  ) {
    super();
  }

  async validate({ body }: Request): Promise<boolean> {
    const token: string = body.refresh_token;
    const userEmail: string = body.email;

    const refreshToken: Loaded<RefreshToken> | null = await this.em.getRepository(RefreshToken).findOne({
      identifier: userEmail,
    });

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    return bcrypt.compare(token, refreshToken.getRefreshToken());
  }
}
