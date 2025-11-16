import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import {
  AppConfig,
  Config,
  DatabaseConfig,
  JwtConfig,
  CryptoConfig,
} from './interfaces/config.interfaces';

@Injectable()
export class ConfigService {
  // Add your custom methods and properties here
  constructor(private configService: NestConfigService<Config, true>) {}

  /*
    Get Complete configurations object
  */
  get config(): Config {
    return {
      app: this.appConfig,
      database: this.databaseConfig,
      jwt: this.jwtConfig,
      crypto: this.cryptoConfig,
    };
  }

  /*
    Get App configurations
  */
  get appConfig(): AppConfig {
    return {
      port: this.configService.get<string>('app.port', { infer: true }),
      nodeEnv: this.configService.get<string>('app.nodeEnv', { infer: true }),
      apiPrefix: this.configService.get<string>('app.apiPrefix', { infer: true }),
    };
  }

  /*
    Get Database configurations
  */
  get databaseConfig(): DatabaseConfig {
    return {
      host: this.configService.get<string>('database.host', { infer: true }),
      port: this.configService.get<number>('database.port', { infer: true }) as number,
      username: this.configService.get<string>('database.username', { infer: true }),
      password: this.configService.get<string>('database.password', { infer: true }),
      database: this.configService.get<string>('database.database', { infer: true }),
      // Fix: Get boolean value properly
      synchronize: this.configService.get<boolean>('database.synchronize', {
        infer: true,
      }) as boolean,
    };
  }

  /*
    Get JWT configurations
  */
  get jwtConfig(): JwtConfig {
    return {
      secret: this.configService.get<string>('jwt.secret', { infer: true }),
      expiresIn: this.configService.get<string>('jwt.expiresIn', { infer: true }),
      refreshSecret: this.configService.get<string>('jwt.refreshSecret', { infer: true }),
      refreshExpiresIn: this.configService.get<string>('jwt.refreshExpiresIn', { infer: true }),
    };
  }

  /*
    Get Crypto configurations
  */
  get cryptoConfig(): CryptoConfig {
    return {
      encryptionKey: this.configService.get<string>('crypto.encryptionKey', { infer: true }),
      saltRounds: this.configService.get<number>('crypto.saltRounds', { infer: true }) as number,
    };
  }

  // check if running in productions
  get isProduction(): boolean {
    return this.appConfig.nodeEnv === 'production';
  }

  // check if running in development
  get isDevelopment(): boolean {
    return this.appConfig.nodeEnv === 'development';
  }

  // check if running in test
  get isTest(): boolean {
    return this.appConfig.nodeEnv === 'test';
  }
}
