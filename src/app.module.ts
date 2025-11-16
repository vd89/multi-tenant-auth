import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService as CustomConfigService } from './config/config.service';
import configuration from './config/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true, // Makes the config module global
    }),

    DatabaseModule.forRootAsync({
      // imports: [ ConfigModule ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          options: {
            type: 'postgres',
            host: configService.get<string>('database.host'),
            port: Number(configService.get<number>('database.port')),
            username: configService.get<string>('database.username'),
            password: configService.get<string>('database.password'),
            database: configService.get<string>('database.database'),
            autoLoadEntities: true,
            entities: [],
            logging: configService.get<string>('app.environment') === 'development',
            synchronize: configService.get<string>('app.environment') === 'development', // Use the synchronize value from config
          },
        };
      },
    }),
    // Health check module for monitoring application health
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [AppService, CustomConfigService],
})
export class AppModule {}
