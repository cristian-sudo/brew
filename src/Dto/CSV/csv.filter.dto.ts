import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export default class CsvFilterDto {
  @IsOptional()
  @ApiProperty(
    {
      example: 1,
      type: Number,
      default: '',
      required: false,
    },
  )
    user!: number;

  @IsOptional()
  @ApiProperty(
    {
      example: '2022-07-08',
      default: '',
      type: String,
      required: false,
    },
  )
    from!: string;

  @IsOptional()
  @ApiProperty(
    {
      example: '2022-07-10',
      default: '',
      type: String,
      required: false,
    },
  )
  @ApiProperty()
    to!: string;
}
