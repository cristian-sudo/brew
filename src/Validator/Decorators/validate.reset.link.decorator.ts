import {
  registerDecorator, ValidationOptions,
} from 'class-validator';
import ValidateResetLinkConstraint from '../Constraints/validate.reset.link.constraint';

export default function ResetLink(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: ValidateResetLinkConstraint,
    });
  };
}
