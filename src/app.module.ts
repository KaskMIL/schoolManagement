import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'node:path';
import { AuthModule } from './auth/auth.module';
import { FamiliesModule } from './families/families.module';
import { FeeConceptsModule } from './fee-concepts/fee-concepts.module';
import { FeePricesModule } from './fee-prices/fee-prices.module';
import { InstallmentsModule } from './installments/installments.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { PaymentsModule } from './payments/payments.module';
import { PriceTiersModule } from './price-tiers/price-tiers.module';
import { StudentServicesModule } from './student-services/student-services.module';
import { StudentsModule } from './students/students.module';
import { SystemConfigModule } from './system-config/system-config.module';
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
    PriceTiersModule,
    FeeConceptsModule,
    FeePricesModule,
    StudentServicesModule,
    SystemConfigModule,
    InstallmentsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
