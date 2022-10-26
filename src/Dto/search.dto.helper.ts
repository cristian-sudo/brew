import { ApiProperty } from '@nestjs/swagger';

export default class SearchDtoHelper {
  @ApiProperty()
    field!:string;
}
