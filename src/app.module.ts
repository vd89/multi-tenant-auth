import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService as CustomConfigService } from './config/config.service';
import configuration from './config/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TenantModule } from './tenant/tenant.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TenantContextGuard } from './auth/guards/tenant-context.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

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
    CommonModule, // Must come before Auth/User
    TenantModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CustomConfigService,

    // Global Guards (execute in reverse registration order)
    // Register JwtAuthGuard first, so TenantContextGuard runs before it
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantContextGuard,
    },

    // Global Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
