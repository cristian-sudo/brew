import {
  IsInt, IsString, Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import Deal from '../../Entity/Deal/deal.entity';

export default class DealDto {
  @ApiProperty()
  @IsString()
  @Length(1, Deal.STRING_MAX_LENGTH)
    name!: string;

  @ApiProperty()
  @IsString()
  @Length(1, Deal.STRING_MAX_LENGTH)
    description!: string;

  @ApiProperty()
  @IsString()
  @Length(1, Deal.STRING_MAX_LENGTH)
    dealCondition!: string;

  @ApiProperty()
  @IsInt()
    price!: number;
}
