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
      // envFilePath: '.env', // Path to your .env file
    }),
    // TypeOrmModule setup with async configuration
    // TypeOrmModule.forRootAsync({
    //   inject: [ ConfigService ],
    //   useFactory: (configService: ConfigService) => {
    //     const dbConfig = configService.databaseConfig;
    //     return {
    //       type: 'postgres',
    //       host: dbConfig.host,
    //       port: Number(dbConfig.port),
    //       username: dbConfig.username,
    //       password: dbConfig.password,
    //       database: dbConfig.database,
    //       autoLoadEntities: true,
    //       entities: [ __dirname + '/**/*.entity{.ts,.js}' ],
    //       logging: configService.isDevelopment,
    //       synchronize: !configService.isProduction, // Use the synchronize value from config
    //     };
    //   },
    // }),
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
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
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
