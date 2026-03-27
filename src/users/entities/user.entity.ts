import { Session } from '@/auth/entities/session.entity';
import {
  Cascade,
  Collection,
  Entity,
  Enum,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import * as uuid from 'uuid';
import { Role } from './role.enum';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7();

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date();

  @OneToMany(() => Session, (session) => session.user, {
    cascade: [Cascade.ALL],
  })
  readonly sessions: Collection<Session> = new Collection<Session>(this);

  @Property({ type: 'timestamptz', nullable: true })
  disabledAt: Date | null = null;

  @Property({ type: 'text', unique: true })
  username: string;

  @Property({ type: 'text', hidden: true })
  passwordHash: string;

  @Enum({ items: () => Role, nativeEnumName: 'role' })
  role: Role;

  constructor(props: UserProps) {
    this.username = props.username;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
  }

  updateProfile(update: ProfileUpdate) {
    this.username = update.username;
    this.role = update.role;
  }

  updatePassword(passwordHash: string) {
    this.passwordHash = passwordHash;
  }

  disable() {
    this.disabledAt = new Date();
  }

  restore() {
    this.disabledAt = null;
  }

  isActive() {
    return this.disabledAt === null;
  }

  isDisabled() {
    return this.disabledAt !== null;
  }
}

export type UserProps = Pick<User, 'username' | 'passwordHash' | 'role'>;
export type ProfileUpdate = Pick<User, 'username' | 'role'>;
