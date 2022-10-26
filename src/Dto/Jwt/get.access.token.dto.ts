import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import PasswordValidation from '../../Validator/Decorators/password.validation.decorator';

export default class GetAccessTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
    email!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @PasswordValidation('email')
    password!: string;
}
