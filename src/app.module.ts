import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'node:path';
import { AuthModule } from './auth/auth.module';
import { FamiliesModule } from './families/families.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve('public'),
      exclude: ['/api/{*splat}'],
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      driver: PostgreSqlDriver,
      useFactory: (configService: ConfigService) => ({
        driver: PostgreSqlDriver,
        entities: ['./dist/**/*.entity.js'],
        entitiesTs: ['./src/**/*.entity.ts'],
        ignoreUndefinedInQuery: true,
        debug: configService.get('NODE_ENV') !== 'production',
        clientUrl: configService.getOrThrow('DATABASE_URL'),
      }),
    }),
    UsersModule,
    AuthModule,
    FamiliesModule,
    InstitutionsModule,
    StudentsModule,
  ],
})
export class AppModule {}
