import {
  ExceptionFilter, Catch, ArgumentsHost,
} from '@nestjs/common';
import { Request, Response } from 'express';
import ValidationException from '../Exception/validation.exception';

@Catch(ValidationException)
export default class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const { message } = exception;

    response
      .status(status)
      .json({
        message,
        statusCode: 422,
        path: request.url === '' ? 'root' : request.url,
        violations: exception.validationErrors,
      });

    return response;
  }
}
