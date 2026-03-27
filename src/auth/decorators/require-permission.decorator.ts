import { SetMetadata } from '@nestjs/common';

export const RequirePermission = (name: string) =>
  SetMetadata('require-permission', name);
