import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    if (typeof request.session === 'undefined')
      throw new Error('req.session is undefined');
    return request.session;
  },
);
