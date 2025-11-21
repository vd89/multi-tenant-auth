export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string = 'Bearer';
}

export class RefreshTokenDto {
  refreshToken: string;
}
