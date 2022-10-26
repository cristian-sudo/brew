import {
  registerDecorator, ValidationOptions,
} from 'class-validator';
import UniqueFieldConstraint from '../Constraints/unique.field.constraint';

export default function UniqueField(entity: any, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: entity,
      validator: UniqueFieldConstraint,
    });
  };
}
