export interface TenantContext {
  tenantId: string;
  subdomain: string;
  dbConfig: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
}

declare module 'express' {
  export interface Request {
    tenantContext?: TenantContext;
  }
}
