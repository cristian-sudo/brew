import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EntityManager } from '@mikro-orm/mysql';
import User from '../../Entity/User/user.entity';

@ValidatorConstraint({ name: 'PasswordValidation', async: true })
@Injectable()
export default class PasswordValidationConstraint implements ValidatorConstraintInterface {
  constructor(private readonly em: EntityManager) {}

  defaultMessage(args: ValidationArguments): string {
    const match = args.constraints[1];

    if (match) {
      return 'New password cannot be the same as previous.';
    }

    return 'The password entered does not match the email provided.';
  }

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [userEmail, match] = args.constraints;
    const email = (args.object as any)[userEmail];

    const user = await this.em.getRepository(User).findOne({ email });

    if (!user) {
      throw new NotFoundException('There is no user registered to this email');
    }

    return await bcrypt.compare(value, user.getPassword()) === match;
  }
}
