export interface DatabaseConfig {
  host: string;
  port: number | string;
  username: string;
  password: string;
  database: string;
  synchronize: boolean | string;
}
export interface JwtConfig {
  secret: string;
  expiresIn: number | string;
  refreshSecret: string;
  refreshExpiresIn: number | string;
}

export interface AppConfig {
  port: number | string;
  nodeEnv: string;
  apiPrefix: string;
}

export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
}

export interface ConfigModuleOptions {
  imports?: never[];
  isGlobal?: boolean;
  envFilePath?: string | string[];
}
