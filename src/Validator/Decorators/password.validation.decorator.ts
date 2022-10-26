import {
  registerDecorator, ValidationOptions,
} from 'class-validator';
import PasswordValidationConstraint from '../Constraints/password.validation.constraint';

export default function PasswordValidation(
  property: string,
  match: boolean = true,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property, match],
      validator: PasswordValidationConstraint,
    });
  };
}
