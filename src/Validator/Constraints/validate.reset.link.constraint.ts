import { Injectable } from '@nestjs/common';
import { ValidatorConstraint } from 'class-validator';
import { ValidatorConstraintInterface } from 'class-validator/types/validation/ValidatorConstraintInterface';
import { EntityManager } from '@mikro-orm/mysql';
import { Loaded } from '@mikro-orm/core';
import PasswordReset from '../../Entity/User/Password/password.reset.entity';

@ValidatorConstraint({ name: 'ValidateResetLinkConstraint', async: true })
@Injectable()
export default class ValidateResetLinkConstraint implements ValidatorConstraintInterface {
  constructor(private readonly em: EntityManager) {
  }

  static readonly EXPIRE_TIME = 24;

  defaultMessage(): string {
    return `${ValidateResetLinkConstraint.EXPIRE_TIME} hours have passed since you made this request, 
    please request another or contact the site admin.`;
  }

  async validate(value: any): Promise<boolean> {
    const passwordReset:Loaded<PasswordReset, never> | null = await this.em.getRepository(PasswordReset)
      .findOne({ resetLink: value });

    if (!passwordReset) {
      return false;
    }

    if (Date.now() > Number(passwordReset.getTimeStamp())) {
      await this.em.getRepository(PasswordReset).remove(passwordReset);

      return false;
    }

    return true;
  }
}
