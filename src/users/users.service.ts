import { PaginationOptions } from '@/common/pagination-options.schema';
import {
  EntityManager,
  UniqueConstraintViolationException,
} from '@mikro-orm/postgresql';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from './entities/role.enum';
import { User } from './entities/user.entity';
import { PasswordService } from './password.service';
import { NewUser } from './schemas/new-user.schema';
import { PasswordUpdate } from './schemas/password-update.schema';
import { ProfileUpdate } from './schemas/profile-update.schema';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(this.constructor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly em: EntityManager,
  ) {}

  async createUser(data: NewUser) {
    const { password, ...rest } = data;
    const passwordHash = await this.passwordService.hash(password);
    const user = new User({ passwordHash, ...rest });
    try {
      await this.em.persist(user).flush();
    } catch (err: unknown) {
      if (err instanceof UniqueConstraintViolationException)
        throw new ConflictException('Username is already in use');
      throw err;
    }
  }

  async listUsers(opts: PaginationOptions) {
    return this.usersRepository.findAll(opts);
  }

  async getUser(userId: string) {
    const user = await this.usersRepository.findOneById(userId);
    if (user === null) throw new NotFoundException();
    return user;
  }

  async updateProfile(userId: string, update: ProfileUpdate) {
    const user = await this.usersRepository.findOneById(userId);
    if (user === null) throw new NotFoundException();
    user.updateProfile(update);
    try {
      await this.em.persist(user).flush();
    } catch (err: unknown) {
      if (err instanceof UniqueConstraintViolationException)
        throw new ConflictException('Username is already in use');
      throw err;
    }
  }

  async updatePassword(userId: string, update: PasswordUpdate) {
    const user = await this.usersRepository.findOneById(userId);
    if (user === null) throw new NotFoundException();
    const passwordHash = await this.passwordService.hash(update.password);
    user.updatePassword(passwordHash);
    await this.em.flush();
  }

  async disableUser(userId: string) {
    const user = await this.usersRepository.findOneById(userId);
    if (user === null) throw new NotFoundException();
    user.disable();
    await this.em.flush();
  }

  async restoreUser(userId: string) {
    const user = await this.usersRepository.findOneById(userId);
    if (user === null) throw new NotFoundException();
    user.restore();
    await this.em.flush();
  }

  async deleteUser(userId: string) {
    const user = await this.usersRepository.findOneById(userId);
    if (user === null) throw new NotFoundException();
    if (user.isActive())
      throw new ConflictException('User must be disabled before removal');
    await this.em.remove(user).flush();
  }

  async onApplicationBootstrap() {
    // Must fork outside request context.
    const em = this.em.fork();
    const repository = new UsersRepository(em);

    const password = this.configService.getOrThrow<string>('ROOT_PASSWORD');
    const existingUser = await repository.findOneByUsername('root');
    if (existingUser !== null) return;

    this.logger.log('Creating root user...');
    const passwordHash = await this.passwordService.hash(password);
    const user = new User({ username: 'root', role: Role.Admin, passwordHash });
    await em.persist(user).flush();
  }
}
