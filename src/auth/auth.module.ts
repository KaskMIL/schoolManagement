import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  AuthenticationGuard,
  AuthenticationGuardProvider,
} from './authentication.guard';
import {
  AuthorizationGuard,
  AuthorizationGuardProvider,
} from './authorization.guard';
import { SessionsRepository } from './sessions.repository';

@Module({
  imports: [ConfigModule, UsersModule],
  controllers: [AuthController],
  providers: [
    SessionsRepository,
    AuthService,
    AuthenticationGuard,
    AuthenticationGuardProvider,
    AuthorizationGuard,
    AuthorizationGuardProvider,
  ],
})
export class AuthModule {}
