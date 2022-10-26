import {
  Injectable, UnprocessableEntityException,
} from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint } from 'class-validator';
import { ValidatorConstraintInterface } from 'class-validator/types/validation/ValidatorConstraintInterface';
import { EntityManager } from '@mikro-orm/mysql';

@ValidatorConstraint({ name: 'EntityHasStatus', async: true })
@Injectable()
export default class EntityHasStatusValidationConstraint implements ValidatorConstraintInterface {
  constructor(private readonly em: EntityManager) {
  }

  defaultMessage(): string {
    return 'Status provided is not a valid status';
  }

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const targetEntity: any = args.constraints[0];
    const statusEntity: any = args.constraints[1];
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const statusValue: string = args.constraints[2];

    if (!targetEntity || !statusEntity || !statusValue || typeof value !== 'number') {
      throw new UnprocessableEntityException();
    }

    const status = await this.em.getRepository(statusEntity).findOneOrFail({ name: statusValue });
    const entity = await this.em.getRepository(targetEntity).findOneOrFail({ id: value });

    // @ts-ignore
    return status.getId() === entity.getStatus().getId();
  }
}
