import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import ResetLink from '../../../Validator/Decorators/validate.reset.link.decorator';

export default class ValidateLinkDto {
  @ApiProperty()
  @IsString()
  @ResetLink()
    resetLink!: string;
}
