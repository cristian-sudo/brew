import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus, NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  StreamableFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiQuery, ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { EntityManager, Loaded } from '@mikro-orm/core';
import Deal from '../../Entity/Deal/deal.entity';
import DealDto from '../../Dto/Deal/deal.dto';
import DealRepository from '../../Repository/Deal/deal.repository';
import DealApproveDto from '../../Dto/Deal/deal.approve.dto';
import CsvFilterDto from '../../Dto/CSV/csv.filter.dto';
import AdminHandler from '../../Service/Handler/Admin/admin.handler';
import CsvFile from '../../Entity/CSV/csv.file.entity';

@ApiTags('Admin/Deal')
@ApiBearerAuth('defaultBearerAuth')
@Controller('api/admin/deal')
export default class AdminDealController {
  constructor(
    private dealRepository:DealRepository,
    private adminHandler:AdminHandler,
    private em: EntityManager,
  ) {
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async getDeals() {
    return this.dealRepository.findAll();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('admin'))
  @Get('/csv')
  @ApiQuery({
    name: 'query',
    required: false,
    type: [CsvFilterDto],
  })
  @HttpCode(HttpStatus.OK)
  async cvs(
    @Query() query: any,

  ): Promise<any> {
    return this.adminHandler.generateCVS(query);
  }

  @Get('/csv/download/:id')
  async getCSV(@Param('id') id: number): Promise<StreamableFile> {
    const csv: CsvFile = await this.em.getRepository(CsvFile).findOneOrFail({ id });

    const file = createReadStream(join(process.cwd(), csv.getPath()));

    return new StreamableFile(file);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('admin'))
  @Post('/approveDeal')
  @HttpCode(HttpStatus.OK)
  async approveDeal(@Query() query:DealApproveDto): Promise<any> {
    const deal = await this.dealRepository.findOneById(query.id);

    if (!deal) {
      throw new NotFoundException();
    }

    return this.adminHandler.approveDeal(deal);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('admin'))
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getDealById(@Param('id') id: number) {
    const deal:Loaded<Deal> | null = await this.dealRepository.findOneById(id);

    if (!deal) {
      throw new NotFoundException();
    }

    return deal;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('admin'))
  @Put('/edit/:id')
  @HttpCode(HttpStatus.OK)
  async edit(@Req() req: Request, @Body() dto: DealDto, @Param('id') id: number): Promise<Deal> {
    const deal: Loaded<Deal> | null = await this.dealRepository.findOneById(id);

    if (!deal) {
      throw new NotFoundException();
    }

    return this.adminHandler.editDeal(dto, deal);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('admin'))
  @Post('/delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeal(@Req() req: Request, @Param('id') id: number) {
    return this.dealRepository.deleteOneById(id);
  }
}
