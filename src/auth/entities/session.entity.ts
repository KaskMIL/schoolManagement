import { User } from '@/users/entities/user.entity';
import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  ref,
  Ref,
} from '@mikro-orm/core';
import * as uuid from 'uuid';

@Entity({ tableName: 'sessions' })
export class Session {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7();

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date();

  @ManyToOne(() => User, { ref: true })
  readonly user: Ref<User>;

  @Property({ type: 'timestamptz' })
  readonly expireAt: Date;

  constructor(user: User, expireAt: Date) {
    this.user = ref(user);
    this.expireAt = expireAt;
  }
}
