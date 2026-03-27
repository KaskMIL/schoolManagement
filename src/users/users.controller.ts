import { RequirePermission } from '@/auth/decorators/require-permission.decorator';
import {
  PaginationOptions,
  paginationOptionsSchema,
} from '@/common/pagination-options.schema';
import { UuidPipe } from '@/common/uuid.pipe';
import { ZodPipe } from '@/common/zod.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NewUser, newUserSchema } from './schemas/new-user.schema';
import {
  PasswordUpdate,
  passwordUpdateSchema,
} from './schemas/password-update.schema';
import {
  ProfileUpdate,
  profileUpdateSchema,
} from './schemas/profile-update.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermission('users:create')
  async createUser(@Body(new ZodPipe(newUserSchema)) data: NewUser) {
    return this.usersService.createUser(data);
  }

  @Get()
  @RequirePermission('users:list')
  async listUsers(
    @Query(new ZodPipe(paginationOptionsSchema)) opts: PaginationOptions,
  ) {
    return this.usersService.listUsers(opts);
  }

  @Get(':userId')
  @RequirePermission('users:show')
  async getUser(@Param('userId', UuidPipe) userId: string) {
    return this.usersService.getUser(userId);
  }

  @Patch(':userId/profile')
  @RequirePermission('users:update-profile')
  async updateProfile(
    @Param('userId', UuidPipe) userId: string,
    @Body(new ZodPipe(profileUpdateSchema)) update: ProfileUpdate,
  ) {
    return this.usersService.updateProfile(userId, update);
  }

  @Patch(':userId/password')
  @RequirePermission('users:update-password')
  async updatePassword(
    @Param('userId', UuidPipe) userId: string,
    @Body(new ZodPipe(passwordUpdateSchema)) update: PasswordUpdate,
  ) {
    return this.usersService.updatePassword(userId, update);
  }

  @Post(':userId/disable')
  @RequirePermission('users:disable')
  async disableUser(@Param('userId', UuidPipe) userId: string) {
    return this.usersService.disableUser(userId);
  }

  @Post(':userId/restore')
  @RequirePermission('users:restore')
  async restoreUser(@Param('userId', UuidPipe) userId: string) {
    return this.usersService.restoreUser(userId);
  }

  @Delete(':userId')
  @RequirePermission('users:delete')
  async deleteUser(@Param('userId', UuidPipe) userId: string) {
    return this.usersService.deleteUser(userId);
  }
}
