import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { IJwtPayLoad, ITokens } from 'src/common/interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register New User
   */

  async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
    const user = await this.userService.createUser(registerDto);
    const tokens = await this.generateTokens(user.id!, user.email!, user.tenant_id!);

    await this.userService.updateRefreshToken(user.id!, tokens.refreshToken);
    return this.formatTokenResponse(tokens);
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    // Find user
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.tenant_id);

    // Update refresh token and last login
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);
    await this.userService.updateLastLogin(user.id);

    return this.formatTokenResponse(tokens);
  }

  /**
   * Refresh access token
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<TokenResponseDto> {
    // Validate refresh token
    const isValid = await this.userService.validateRefreshToken(userId, refreshToken);

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user
    const user = await this.userService.getUserForAuth(userId);

    // Generate new tokens (token rotation)
    const tokens = await this.generateTokens(user.id, user.email, user.tenant_id);

    // Update refresh token
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return this.formatTokenResponse(tokens);
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    // Clear refresh token
    await this.userService.updateRefreshToken(userId, null);
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(userId: string, email: string, tenantId: string): Promise<ITokens> {
    const payload: IJwtPayLoad = {
      sub: userId,
      email,
      tenantId,
    };

    const accessSecret = this.configService.get<string>('jwt.secret')!;
    const accessExpiry = this.configService.get<string>('jwt.expiresIn', '15m');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret')!;
    const refreshExpiry = this.configService.get<string>('jwt.refreshExpiresIn', '7d');

    // Generate both tokens in parallel
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: this.getExpiresInSeconds(accessExpiry),
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: this.parseExpiryToSeconds(refreshExpiry),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Format token response
   */
  private formatTokenResponse(tokens: ITokens): TokenResponseDto {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.getExpiresInSeconds(),
      tokenType: 'Bearer',
    };
  }

  /**
   * Get expiration time in seconds
   */
  private getExpiresInSeconds(expiresIn?: string): number {
    const expiry = expiresIn || this.configService.get<string>('jwt.expiresIn', '15m');
    return this.parseExpiryToSeconds(expiry);
  }

  /**
   * Parse duration string to seconds
   */
  private parseExpiryToSeconds(expiresIn: string): number {
    // Parse duration string (e.g., '15m', '1h', '7d')
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }
}
