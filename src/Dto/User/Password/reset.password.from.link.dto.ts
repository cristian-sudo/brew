import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import User from '../../../Entity/User/user.entity';
import StringMatch from '../../../Validator/Decorators/string.match.decorator';

export default class ResetPasswordFromLinkDto {
  @ApiProperty()
  @IsString()
  @Length(User.PASSWORD_MIN_LENGTH, User.STRING_MAX_LENGTH)
    password!: string;

  @ApiProperty()
  @StringMatch('password')
    confirmPassword!: string;
}
