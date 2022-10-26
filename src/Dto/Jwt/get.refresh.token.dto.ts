import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export default class GetRefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
    email!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
    refresh_token!: string;
}
