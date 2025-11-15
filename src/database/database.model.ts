import { DynamicModule, Module } from '@nestjs/common';
import { DatabaseModuleAsyncOptions, DatabaseModuleOptions } from './types/database.types';
import {
  ConnectionManagerService,
  createConnectionManagerProvider,
  createDatabaseConnectionProvider,
  createDatabaseOptionsProvider,
} from './database.provider';
import { DATABASE_CONNECTION, DATABASE_OPTIONS } from './database.constants';

@Module({})
export class DatabaseModule {
  static forRootAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
    const optionsProvider = createDatabaseOptionsProvider(options);
    const connectionProvider = createDatabaseConnectionProvider();
    const connectionManagerProvider = createConnectionManagerProvider();

    return {
      module: DatabaseModule,
      global: true,
      imports: options.imports || [],
      providers: [optionsProvider, connectionProvider, connectionManagerProvider],
      exports: [DATABASE_CONNECTION, ConnectionManagerService],
    };
  }

  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    return {
      module: DatabaseModule,
      global: true,
      providers: [
        {
          provide: DATABASE_OPTIONS,
          useValue: options,
        },
        createDatabaseConnectionProvider(),
        createConnectionManagerProvider(),
      ],
      exports: [DATABASE_CONNECTION, ConnectionManagerService],
    };
  }
}
