import { JwtService } from '@nestjs/jwt';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EntityManager } from '@mikro-orm/mysql';
import config from '../../Config';
import RefreshToken from '../../Entity/User/Token/refresh.token.entity';
import { Token } from '../../Type/Jwt/token.type';
import User from '../../Entity/User/user.entity';
import UserRepository from '../../Repository/User/user.repository';

@Injectable()
export default class TokenHandler {
  constructor(
    private jwtService: JwtService,
    private em: EntityManager,
    private userRepository: UserRepository,
  ) {}

  async getTokens(user: User): Promise<Token> {
    const payload = { email: user.getEmail(), roles: user.getRoles(), sub: user.getId() };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: config.jwt.dev_timer,
        secret: config.jwt.secret_key,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: config.jwt.dev_timer,
        secret: config.jwt.public_key,
      }),
    ]);
    await this.hashRefreshToken(user.getEmail(), refreshToken);

    return {
      user_id: user.getId(),
      expires_in: config.jwt.dev_timer,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshTokens(email: string): Promise<Token> {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException();
    }

    const tokens = await this.getTokens(user);
    await this.hashRefreshToken(user.getEmail(), tokens.refresh_token);

    return tokens;
  }

  private async hashRefreshToken(email: string, refreshToken: string): Promise<RefreshToken> {
    const hashRefreshToken = await bcrypt.hash(refreshToken, 0);
    let refreshTokenExists: RefreshToken | null = await this.em.getRepository(RefreshToken)
      .findOne({ identifier: email });

    if (refreshTokenExists) {
      refreshTokenExists.setRefreshToken(hashRefreshToken);
      await this.em.persistAndFlush(refreshTokenExists);

      return refreshTokenExists;
    }
    refreshTokenExists = new RefreshToken(email, hashRefreshToken);
    await this.em.persistAndFlush(refreshTokenExists);

    return refreshTokenExists;
  }
}
