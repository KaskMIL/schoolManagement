import { ZodPipe } from '@/common/zod.pipe';
import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentSession } from './decorators/current-session.decorator';
import { SkipAuthentication } from './decorators/skip-authentication.decorator';
import { SkipAuthorization } from './decorators/skip-authorization.decorator';
import { Session } from './entities/session.entity';
import { LoginData, loginDataSchema } from './schemas/login-data.schema';

@Controller()
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @SkipAuthentication()
  async login(
    @Res({ passthrough: true }) response: Response,
    @Body(new ZodPipe(loginDataSchema)) data: LoginData,
  ) {
    const session = await this.authService.login(data);
    response.cookie('sid', session.id, {
      httpOnly: true,
      expires: session.expireAt,
      sameSite: 'lax',
      secure: this.configService.get('NODE_ENV') === 'production',
    });
  }

  @Post('logout')
  @SkipAuthorization()
  async logout(
    @Res({ passthrough: true }) response: Response,
    @CurrentSession() session: Session,
  ) {
    await this.authService.logout(session);
    response.clearCookie('sid');
  }

  @Get('me')
  @SkipAuthorization()
  async getCurrentUser(@CurrentSession() session: Session) {
    return this.authService.getCurrentUser(session);
  }
}
