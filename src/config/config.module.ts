import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModuleOptions } from './interfaces/config.interfaces';
import { ConfigService as CustomConfigService } from './config.service';
import configuration from './configuration';

@Global()
@Module({
  imports: [],
  exports: [],
})
export class ConfigModule {
  /**
   * forRoot - Used when you want to configure the module once for the entire application
   * This is the most common pattern for configuration modules
   */
  static forRoot(options: ConfigModuleOptions = {}): DynamicModule {
    return {
      module: ConfigModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: options.isGlobal ?? true,
          envFilePath: options.envFilePath || '.env',
          load: [configuration],
          cache: true, // Cache configuration for performance
          expandVariables: true, // Allow ${VAR} syntax in .env
        }),
      ],
      providers: [
        CustomConfigService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
      ],
      exports: [CustomConfigService, NestConfigModule],
    };
  }

  /*
    register - Used when you want different configurations for different modules
    This is less common but useful for modular applications
  */

  static register(options: ConfigModuleOptions = {}): DynamicModule {
    return {
      module: ConfigModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: options.isGlobal ?? false,
          envFilePath: options.envFilePath || '.env',
          load: [configuration],
          cache: true,
          expandVariables: true,
        }),
      ],
      providers: [
        CustomConfigService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
      ],
      exports: [CustomConfigService, NestConfigModule],
    };
  }

  /*
    forRootAsync - Used when configuration values need to be loaded asynchronously
    This is useful for loading configurations from remote sources or performing async operations
  */

  static forRootAsync(options: ConfigModuleOptions): DynamicModule {
    return {
      module: ConfigModule,
      imports: [
        ...(options.imports || []),
        NestConfigModule.forRoot({
          isGlobal: options.isGlobal ?? true,
          load: [configuration],
          cache: true,
          expandVariables: true,
        }),
      ],
      providers: [
        CustomConfigService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
      ],
      exports: [CustomConfigService],
    };
  }
}
