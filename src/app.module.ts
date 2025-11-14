import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from './config/config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config module global
      envFilePath: '.env', // Path to your .env file
    }),
    // TypeOrmModule setup with async configuration
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.databaseConfig;
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: Number(dbConfig.port),
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          autoLoadEntities: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          logging: configService.isDevelopment,
          synchronize: !configService.isProduction, // Use the synchronize value from config
        };
      },
    }),
    // Health check module for monitoring application health
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
