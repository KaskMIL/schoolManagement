import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

@Catch(ZodError)
export class ZodFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const issues = exception.issues.map((iss) => ({
      path: iss.path.join('.'),
      message: iss.message,
    }));

    const response = host.switchToHttp().getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      message: 'Invalid request body',
      error: 'Bad Request',
      statusCode: HttpStatus.BAD_REQUEST,
      issues,
    });
  }
}
