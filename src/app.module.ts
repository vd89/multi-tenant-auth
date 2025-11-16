import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService as CustomConfigService } from './config/config.service';
import configuration from './config/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: Number(configService.get<number>('database.port')),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // Fix: Use correct environment variable and proper boolean conversion
        logging: configService.get<string>('app.nodeEnv') === 'development',
        synchronize:
          configService.get<boolean>('database.synchronize') ||
          configService.get<string>('app.nodeEnv') === 'development',
        // Add dropSchema for development (optional - be careful!)
        dropSchema:
          configService.get<string>('app.nodeEnv') === 'development' &&
          configService.get<string>('DB_DROP_SCHEMA') === 'true',
      }),
    }),

    TerminusModule,
    TenantModule,
  ],
  controllers: [AppController],
  providers: [AppService, CustomConfigService],
})
export class AppModule {}
