import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export interface ValidationMessage {
  property: string;
  constraints: { [key: string]: string };
}

@Catch(BadRequestException)
export class HttpValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = HttpStatus.UNPROCESSABLE_ENTITY;

    const exceptionResponse = exception.getResponse();
    let validationMessages: ValidationMessage[] = [];

    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const messages = exceptionResponse['message'];
      if (Array.isArray(messages)) {
        const errors = exceptionResponse.message as ValidationError[];

        validationMessages = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints || {},
        }));
      }
    }

    const errorResponse = {
      status: status,
      message: 'Validation failed.',
      validationMessages: validationMessages,
    };

    response.status(status).json(errorResponse);
  }
}
