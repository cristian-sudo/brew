import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsString, Length,
} from 'class-validator';
import User from '../../Entity/User/user.entity';
import StringMatch from '../../Validator/Decorators/string.match.decorator';
import UniqueField from '../../Validator/Decorators/unique.field.decorator';

export default class UserRegisterDto {
  @ApiProperty()
  @Length(1, User.STRING_MAX_LENGTH)
  @IsEmail()
  @UniqueField(User)
    email!: string;

  @ApiProperty()
  @IsString()
  @Length(1, User.STRING_MAX_LENGTH)
    firstName!: string;

  @ApiProperty()
  @IsString()
  @Length(1, User.STRING_MAX_LENGTH)
    lastName!: string;

  @ApiProperty()
  @IsString()
  @Length(User.PASSWORD_MIN_LENGTH, User.STRING_MAX_LENGTH)
    password!: string;

  @ApiProperty()
  @StringMatch('password')
    confirmPassword!: string;
}
