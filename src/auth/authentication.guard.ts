import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Provider,
  UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Session } from './entities/session.entity';
import { SessionsRepository } from './sessions.repository';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isAuthenticationSkipped = this.reflector.getAllAndOverride<boolean>(
      'skip-authentication',
      [context.getHandler(), context.getClass()],
    );
    if (isAuthenticationSkipped) return true;

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const sessionId = request.cookies.sid as unknown;
    if (typeof sessionId !== 'string') {
      response.clearCookie('sid');
      throw new UnauthorizedException();
    }

    const session = await this.sessionsRepository.findOneById(sessionId);
    if (session === null || session.expireAt < new Date()) {
      response.clearCookie('sid');
      throw new UnauthorizedException();
    }

    request.session = session;
    return true;
  }
}

export const AuthenticationGuardProvider: Provider = {
  provide: APP_GUARD,
  useClass: AuthenticationGuard,
};

declare module 'express' {
  interface Request {
    session: Session;
  }
}
