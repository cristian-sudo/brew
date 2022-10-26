import 'dotenv/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import AuthController from '../../Controller/Auth/auth.controller';
import TokenHandler from '../../Auth/Jwt/token.handler';
import AdminAccessStrategy from '../../Auth/Strategies/admin.access.strategy';
import UserAccessStrategy from '../../Auth/Strategies/user.access.strategy';
import RefreshTokenStrategy from '../../Auth/Strategies/refresh.token.strategy';
import UserRepository from '../../Repository/User/user.repository';
import PasswordValidationConstraint from '../../Validator/Constraints/password.validation.constraint';

@Module({
  imports: [JwtModule.register({}), MikroOrmModule.forRoot()],
  controllers: [AuthController],
  providers: [
    UserAccessStrategy,
    RefreshTokenStrategy,
    TokenHandler,
    PasswordValidationConstraint,
    AdminAccessStrategy,
    UserRepository,
  ],
  exports: [UserRepository],
})
export default class AuthModule {}
