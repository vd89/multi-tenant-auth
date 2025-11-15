import { Inject, Injectable, Provider } from '@nestjs/common';
import { DatabaseModuleAsyncOptions, DatabaseModuleOptions } from './types/database.types';
import { DATABASE_CONNECTION, DATABASE_OPTIONS } from './database.constants';
import { DataSource } from 'typeorm';

export function createDatabaseOptionsProvider(options: DatabaseModuleAsyncOptions): Provider {
  return {
    provide: DATABASE_OPTIONS,
    useFactory: async (...args: any[]): Promise<DatabaseModuleOptions> => {
      const dbOptions = await options.useFactory(...args);
      return dbOptions;
    },
    inject: options.inject || [],
  };
}

export function createDatabaseConnectionProvider(): Provider {
  return {
    provide: DATABASE_CONNECTION,
    useFactory: async (dbOptions: DatabaseModuleOptions): Promise<DataSource> => {
      const dataSource = new DataSource({ ...dbOptions.options });
      await dataSource.initialize();
      return dataSource;
    },
    inject: [DATABASE_OPTIONS],
  };
}

@Injectable()
export class ConnectionManagerService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly dataSource: DataSource) {}

  getDataSource(): DataSource {
    return this.dataSource;
  }

  inConnection(): boolean {
    return this.dataSource.isInitialized;
  }

  async query(sql: string, parameters?: any[]): Promise<any> {
    return this.dataSource.query(sql, parameters);
  }
}

export function createConnectionManagerProvider(): Provider {
  return {
    provide: ConnectionManagerService,
    useClass: ConnectionManagerService,
  };
}
