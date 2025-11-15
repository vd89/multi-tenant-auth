import { ModuleMetadata } from '@nestjs/common';
import { DataSourceOptions } from 'typeorm';

/**
 *  Database Configuration interface
 *
 * this defines what configurations our database module will accept
 * Similar to ConfigModuleOptions in config module
 *
 */

export interface DatabaseModuleOptions {
  /**
   * Optional: Name for this connections
   * useful when working with multiple database connections
   */
  name?: string;
  /**
   * TypeORM DataSource options configurations
   * All the options TypeORM DataSource accepts can be passed here
   */
  options: DataSourceOptions;
}

/**
 * ASYNC Database Configuration interface
 */
export interface DatabaseModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Optional: Name for this connections
   * useful when working with multiple database connections
   */
  name?: string;
  /**
   * Imports required modules
   * e.g ConfigModule if you want to load config service to build options
   */
  imports?: any[];
  /**
   * Factory function that returns DatabaseModuleOptions
   * Can be async and return a Promise
   */
  useFactory: (...args: any[]) => Promise<DatabaseModuleOptions> | DatabaseModuleOptions;
  /**
   * Injected dependencies for the factory function
   * e.g [ConfigService] if you need config service to build options
   */
  inject?: any[];
}

export interface DatabaseOptionsFactory {
  createDatabaseOptions(): Promise<DatabaseModuleOptions> | DatabaseModuleOptions;
}
