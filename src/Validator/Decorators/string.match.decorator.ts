import {
  registerDecorator, ValidationOptions,
} from 'class-validator';
import StringMatchConstraint from '../Constraints/string.match.constraint';

export default function StringMatch(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: StringMatchConstraint,
    });
  };
}
