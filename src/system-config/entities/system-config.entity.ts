import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'system_config' })
export class SystemConfig {
  @PrimaryKey({ type: 'text' })
  readonly key: string;

  @Property({ type: 'text' })
  value: string;

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date();

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }
}
