import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'StringMatch' })
export default class StringMatchConstraint implements ValidatorConstraintInterface {
  defaultMessage(): string {
    return 'The new password and the confirm password needs to match!';
  }

  validate(value: any, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];

    return value === relatedValue;
  }
}
