import { SetMetadata } from '@nestjs/common';

export const SkipAuthentication = () =>
  SetMetadata('skip-authentication', true);
