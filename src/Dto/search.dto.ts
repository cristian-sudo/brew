import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import SearchDtoHelper from './search.dto.helper';

export default class SearchDto {
  @IsOptional()
  @ApiProperty(
    {
      example: 10,
      type: Number,
      required: false,
    },
  )
    limit!: number;

  @IsOptional()
  @ApiProperty(
    {
      example: { status: 'approved' },
      type: [SearchDtoHelper],
      required: false,
    },
  )
    filter!: SearchDtoHelper;

  @IsOptional()
  @ApiProperty(
    {
      example: { status: 'ASC' },
      type: [SearchDtoHelper],
      required: false,
    },
  )
  @ApiProperty()
    sort!:SearchDtoHelper;
}
