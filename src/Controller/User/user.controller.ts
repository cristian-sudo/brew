import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  Put,
  NotFoundException,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { EntityName } from '@mikro-orm/core/typings';
import UserRegisterDto from '../../Dto/User/user.register.dto';
import UserRepository from '../../Repository/User/user.repository';
import UserEditDto from '../../Dto/User/user.edit.dto';
import UserHandler from '../../Service/Handler/User/user.handler';
import User, { CurrentUserInterface } from '../../Entity/User/user.entity';
import UrlSearchParam from '../../Helper/url.search.param';
import Status from '../../Entity/User/status.entity';
import ForgottenPasswordDto from '../../Dto/User/Password/forgotten.password.dto';
import { ResetLink } from '../../Type/Password/resetLink.type';
import ResetPasswordFromLinkDto from '../../Dto/User/Password/reset.password.from.link.dto';
import { Token } from '../../Type/Jwt/token.type';
import PasswordHandler from '../../Service/Handler/Password/password.handler';
import ValidateLinkDto from '../../Dto/User/Password/reset.password.link.dto';
import SearchDto from '../../Dto/search.dto';

@ApiTags('User')
@Controller('api/user')
export default class UserController {
  constructor(
    private userRepository: UserRepository,
    private userHandler: UserHandler,
    private urlSearchParam: UrlSearchParam,
    private passwordHandler: PasswordHandler,
  ) {
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/')
  @ApiQuery({
    name: 'query',
    required: false,
    type: [SearchDto],
  })
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Req() req: Request,
      @Query() query: any,
  ): Promise<EntityName<any>[]> {
    return this.urlSearchParam.applyFiltersAndSorting(query, User, Status);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: number): Promise<User> {
    const user = await this.userRepository.getUserById(id);

    if (!user) {
      throw new NotFoundException();
    }

    return user!;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: UserRegisterDto): Promise<User> {
    return this.userHandler.registerUser(dto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AuthGuard('user'))
  @Put('/edit')
  @HttpCode(HttpStatus.OK)
  async edit(@Req() req: Request, @Body() dto: UserEditDto): Promise<User> {
    const currentUser: CurrentUserInterface | User = req.user as CurrentUserInterface;
    const user = await this.userRepository.getUserByEmail(currentUser.email);

    if (!user) {
      throw new NotFoundException();
    }

    return this.userHandler.editUser(user, dto);
  }

  @UseGuards(AuthGuard('user'))
  @ApiBearerAuth('defaultBearerAuth')
  @Post('/delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Req() req: Request, @Body('password') password: string): Promise<User> {
    const currentUser: CurrentUserInterface | User = req.user as CurrentUserInterface;
    const user = await this.userRepository.getUserByEmail(currentUser.email);

    if (!user) {
      throw new NotFoundException();
    }

    return this.userHandler.deleteUser(user, password);
  }

  @UseGuards(AuthGuard('user'))
  @ApiBearerAuth('defaultBearerAuth')
  @Post('/password/request')
  @HttpCode(HttpStatus.OK)
  async request(@Req() req: Request): Promise<ResetLink> {
    const currentUser: CurrentUserInterface | User = req.user as CurrentUserInterface;
    const user = await this.userRepository.getUserById(currentUser.id);

    if (!user) {
      throw new InternalServerErrorException();
    }

    return this.passwordHandler.requestNewPassword(user);
  }

  @Post('/password/request-reset')
  @HttpCode(HttpStatus.OK)
  async forgottenPassword(@Body() dto: ForgottenPasswordDto): Promise<ResetLink> {
    const user = await this.userRepository.getUserByEmail(dto.email);

    if (!user) {
      throw new NotFoundException();
    }

    return this.passwordHandler.requestNewPassword(user);
  }

  @Post('/password/reset')
  @HttpCode(HttpStatus.OK)
  async reset(@Query() query: ValidateLinkDto, @Body() dto: ResetPasswordFromLinkDto): Promise<Token> {
    return this.passwordHandler.reset(query.resetLink, dto);
  }
}
