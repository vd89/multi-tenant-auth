import { Config } from './interfaces/config.interfaces';

export default (): Config => ({
  app: {
    port: parseInt(process.env.APP_PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || 'api/v1',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'multi_tenant_db',
    // Fix: Properly convert string to boolean
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || process.env.NODE_ENV === 'development',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'defaultSecret',
    expiresIn: parseInt(process.env.JWT_EXPIRATION || '3600', 10),
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'defaultRefreshSecret',
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRATION || '86400', 10),
  },
  crypto: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'change-this-32-char-encryption-key',
    saltRounds: parseInt(process.env.CRYPTO_SALT_ROUNDS || '10', 10),
  },
});
