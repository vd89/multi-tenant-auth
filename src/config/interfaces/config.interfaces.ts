export interface DatabaseConfig {
  host: string;
  port: number | string;
  username: string;
  password: string;
  database: string;
  // Fix: Make synchronize properly typed as boolean
  synchronize: boolean;
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

export interface CryptoConfig {
  encryptionKey: string;
  saltRounds: number;
}

export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  crypto: CryptoConfig;
}

export interface ConfigModuleOptions {
  imports?: never[];
  isGlobal?: boolean;
  envFilePath?: string | string[];
}
