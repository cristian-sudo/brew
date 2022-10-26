import {
  registerDecorator, ValidationOptions,
} from 'class-validator';
import { EntityName } from '@mikro-orm/core/typings';
import IsStatusConstraint from '../Constraints/entity.has.status.validation.constraint';

export default function EntityHasStatus(
  targetEntity: EntityName<any>,
  statusEntity:EntityName<any>,
  statusValue:string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [targetEntity, statusEntity, statusValue],
      validator: IsStatusConstraint,
    });
  };
}
