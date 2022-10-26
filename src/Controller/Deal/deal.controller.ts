import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { EntityName } from '@mikro-orm/core/typings';
import { Loaded } from '@mikro-orm/core';
import Deal from '../../Entity/Deal/deal.entity';
import DealDto from '../../Dto/Deal/deal.dto';
import DealHandler from '../../Service/Handler/Deal/deal.handler';
import User, { CurrentUserInterface } from '../../Entity/User/user.entity';
import DealRepository from '../../Repository/Deal/deal.repository';
import DealBuyDto from '../../Dto/Deal/deal.buy.dto';
import DealStatus from '../../Entity/Deal/status.entity';
import UrlSearchParam from '../../Helper/url.search.param';
import SearchDto from '../../Dto/search.dto';

@ApiTags('Deal')
@ApiBearerAuth('defaultBearerAuth')
@Controller('api/deal')
export default class DealController {
  constructor(
    private dealHandler: DealHandler,
    private dealRepository: DealRepository,
    private urlSearchParam: UrlSearchParam,
  ) {
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('user'))
  @Get('/')
  @ApiQuery({
    name: 'query',
    required: false,
    type: [SearchDto],
  })
  @HttpCode(HttpStatus.OK)
  async getDeal(
    @Req() req: Request,
      @Query() query: any,
  ): Promise<EntityName<any>[]> {
    const currentUser: CurrentUserInterface = req.user as CurrentUserInterface;

    return this.urlSearchParam.applyFiltersAndSorting(query, Deal, DealStatus, currentUser);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('user'))
  @Get('/buy')
  @HttpCode(HttpStatus.OK)
  async buyDeal(@Query() query:DealBuyDto, @Req() req: Request) {
    const currentUser: CurrentUserInterface | User = req.user as CurrentUserInterface;
    const deal: Loaded<Deal> | null = await this.dealRepository.findOneById(Number(req.query.id));

    if (!currentUser || !deal) {
      throw new NotFoundException();
    }

    return this.dealHandler.buyDeal(currentUser, deal);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('user'))
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getDealById(@Req() req: Request, @Param('id') id: number) {
    const currentUser: CurrentUserInterface | User = req.user as CurrentUserInterface;

    if (!currentUser) {
      throw new NotFoundException();
    }
    const deal: Deal | null = await this.dealHandler.getDealById(currentUser, id);

    if (!deal) {
      throw new NotFoundException();
    }

    return deal;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('user'))
  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() dto: DealDto): Promise<Deal> {
    const currentUser: CurrentUserInterface | User = req.user as CurrentUserInterface;

    if (!currentUser) {
      throw new NotFoundException();
    }

    return this.dealHandler.createDeal(dto, currentUser);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('user'))
  @Put('/edit/:id')
  @HttpCode(HttpStatus.OK)
  async edit(@Req() req: Request, @Body() dto: DealDto, @Param('id') id: number): Promise<Deal> {
    const currentUser: CurrentUserInterface | User = req.user as CurrentUserInterface;
    const deal: Loaded<Deal> | null = await this.dealRepository.findOneById(id);

    if (!currentUser || !deal) {
      throw new NotFoundException();
    }

    return this.dealHandler.editDeal(dto, currentUser, deal);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('user'))
  @Post('/delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeal(@Req() req: Request, @Param('id') id: number) {
    const currentUser: CurrentUserInterface | User = req.user as CurrentUserInterface;
    const deal: Deal | null = await this.dealRepository.findOneById(id);

    if (!currentUser || !deal) {
      throw new NotFoundException();
    }

    return this.dealHandler.deleteDeal(currentUser, deal);
  }
}
