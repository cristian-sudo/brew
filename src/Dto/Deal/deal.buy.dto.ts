import {
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import Status from '../../Entity/Deal/status.entity';
import EntityHasStatus from '../../Validator/Decorators/entity.has.status.decorator';
import Deal from '../../Entity/Deal/deal.entity';

export default class DealBuyDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @EntityHasStatus(Deal, Status, Status.LIVE)
    id!: number;
}
