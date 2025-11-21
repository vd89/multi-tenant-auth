export interface IJwtPayLoad {
  sub: string;
  email: string;
  tenantId: string;
  iAt?: number; // issued at
  exp?: number; // expiration time
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthenticatedUser {
  userId: string;
  email: string;
  tenantId: string;
  firstName?: string;
  lastName?: string;
}
