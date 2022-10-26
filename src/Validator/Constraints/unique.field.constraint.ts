import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint } from 'class-validator';
import { ValidatorConstraintInterface } from 'class-validator/types/validation/ValidatorConstraintInterface';
import { EntityManager } from '@mikro-orm/mysql';

@ValidatorConstraint({ name: 'UniqueField', async: true })
@Injectable()
export default class UniqueFieldConstraint implements ValidatorConstraintInterface {
  constructor(private readonly em: EntityManager) {
  }

  defaultMessage(args: ValidationArguments): string {
    return `A user with this ${args.property} already exists`;
  }

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const entity: any = args.constraints;
    const field: string = args.property;

    const entry = await this.em.getRepository(entity).findOne({ [field]: value });

    return !entry;
  }
}
