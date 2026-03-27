import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ZodFilter } from './zod.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.disable('x-powered-by');
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ZodFilter());
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT') ?? '8080';
  await app.listen(port);
}

void bootstrap();
