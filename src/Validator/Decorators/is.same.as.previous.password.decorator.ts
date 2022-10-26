import {
  registerDecorator, ValidationOptions,
} from 'class-validator';
import IsSameAsPreviousPasswordConstraint from '../Constraints/is.same.as.previous.password.constraint';

export default function IsSameAsPreviousPassword(UserId: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [UserId],
      validator: IsSameAsPreviousPasswordConstraint,
    });
  };
}
