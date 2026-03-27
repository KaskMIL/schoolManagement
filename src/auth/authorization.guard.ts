import { Role } from '@/users/entities/role.enum';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Provider,
} from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as micromatch from 'micromatch';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly permissions: Record<Role, string[]> = {
    [Role.Admin]: ['*'],
  };

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const isAuthenticationSkipped = this.reflector.getAllAndOverride<boolean>(
      'skip-authentication',
      [context.getHandler(), context.getClass()],
    );
    if (isAuthenticationSkipped) return true;

    const isAuthorizationSkipped = this.reflector.getAllAndOverride<boolean>(
      'skip-authorization',
      [context.getHandler(), context.getClass()],
    );
    if (isAuthorizationSkipped) return true;

    const permissionName = this.reflector.get<string>(
      'require-permission',
      context.getHandler(),
    );
    if (!permissionName) throw new ForbiddenException();

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const user = await request.session.user.loadOrFail();

    const isMatch = micromatch.isMatch(
      permissionName,
      this.permissions[user.role],
    );
    if (!isMatch) throw new ForbiddenException();

    return true;
  }
}

export const AuthorizationGuardProvider: Provider = {
  provide: APP_GUARD,
  useClass: AuthorizationGuard,
};
