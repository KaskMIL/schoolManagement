import { MAX_PASSWORD_LENGTH } from '@/users/constants';
import { PasswordService } from '@/users/password.service';
import { UsersRepository } from '@/users/users.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Session } from './entities/session.entity';
import { LoginData } from './schemas/login-data.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly em: EntityManager,
  ) {}

  async login(data: LoginData) {
    const user = await this.usersRepository.findOneByUsername(data.username);
    if (
      user === null ||
      user.isDisabled() ||
      data.password.length > MAX_PASSWORD_LENGTH
    )
      throw new UnauthorizedException();

    const isCorrectPassword = await this.passwordService.verify(
      user.passwordHash,
      data.password,
    );
    if (!isCorrectPassword) throw new UnauthorizedException();

    const expireAt = new Date(Date.now() + 8 * 8600 * 1000);
    const session = new Session(user, expireAt);
    await this.em.persist(session).flush();
    return session;
  }

  async logout(session: Session) {
    await this.em.remove(session).flush();
  }

  async getCurrentUser(session: Session) {
    return session.user.loadOrFail();
  }
}
