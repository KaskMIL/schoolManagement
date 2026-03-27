import { SetMetadata } from '@nestjs/common';

export const SkipAuthorization = () => SetMetadata('skip-authorization', true);
