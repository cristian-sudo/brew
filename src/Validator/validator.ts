import { validate } from 'class-validator';
import ValidationException from '../Exception/validation.exception';

export default class Validator {
  async validate(obj: {}): Promise<void> {
    await validate(obj).then((errors) => {
      const messages = errors.map(
        (error) => ({
          title: error.property,
          detail: `${error.property} has the wrong value of [ ${error.value} ]`,
          violations: Object.values(error.constraints ? error.constraints : []),
        }),
      );

      if (messages.length !== 0) {
        throw new ValidationException(messages);
      }
    });
  }
}
