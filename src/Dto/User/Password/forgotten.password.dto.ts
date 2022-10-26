import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length } from 'class-validator';
import User from '../../../Entity/User/user.entity';

export default class ForgottenPasswordDto {
  @ApiProperty()
  @Length(1, User.STRING_MAX_LENGTH)
  @IsEmail()
    email!: string;
}
