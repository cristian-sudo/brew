import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import * as bcrypt from 'bcrypt';
import { EntityManager } from '@mikro-orm/mysql';
import User from '../../Entity/User/user.entity';

@ValidatorConstraint({ name: 'IsSameAsPreviousPassword' })
export default class IsSameAsPreviousPasswordConstraint implements ValidatorConstraintInterface {
  constructor(private readonly em: EntityManager) {
  }

  defaultMessage(): string {
    return 'The new password needs to be different than the old one!';
  }

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [relatedPropertyName] = args.constraints;
    const userId = (args.object as any)[relatedPropertyName];
    const user: User = await this.em.getRepository(User).findOneOrFail({ id: userId });

    return !await bcrypt.compare(value, user.getPassword());
  }
}
