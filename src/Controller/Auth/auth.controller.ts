import {
  Body, Controller, Post, HttpCode, HttpStatus, UseGuards, UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import GetAccessTokenDto from '../../Dto/Jwt/get.access.token.dto';
import { Token } from '../../Type/Jwt/token.type';
import TokenHandler from '../../Auth/Jwt/token.handler';
import GetRefreshTokenDto from '../../Dto/Jwt/get.refresh.token.dto';
import UserRepository from '../../Repository/User/user.repository';

@ApiTags('Auth')
@Controller('api/token')
export default class AuthController {
  constructor(
    private userRepository: UserRepository,
    private tokenHandler: TokenHandler,
  ) {}

  @Post('/get')
  @HttpCode(HttpStatus.CREATED)
  async getToken(@Body() dto: GetAccessTokenDto): Promise<Token> {
    const user = await this.userRepository.getUserByEmail(dto.email);

    if (!user) {
      throw new NotFoundException();
    }

    if (user.isDeclined()) {
      throw new UnauthorizedException('Your account has been declined, please contact the support.');
    }

    if (!user.isApproved()) {
      throw new UnauthorizedException('Your account has not been approved yet, '
        + 'please wait while our site admin reviews your application request.');
    }

    return this.tokenHandler.getTokens(user);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('/refresh')
  @HttpCode(HttpStatus.CREATED)
  async refreshToken(@Body() dto: GetRefreshTokenDto): Promise<Token> {
    return this.tokenHandler.refreshTokens(dto.email);
  }
}
