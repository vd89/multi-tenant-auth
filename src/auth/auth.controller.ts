import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto, RefreshTokenDto } from './dto/token-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

// Define the JWT payload type
interface JwtPayload {
  sub: string;
  email?: string;
  tenant_id?: string;
  [key: string]: unknown;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register new user
   * POST /auth/register
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   * POST /auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    // In production, you'd decode the refresh token to get userId
    // For simplicity, we'll require the refresh token body
    // A better approach: use a separate refresh token strategy

    // Decode token to get user ID (without verification - we'll verify in service)
    const { JwtService } = await import('@nestjs/jwt');
    const jwtService = new JwtService();
    const decoded: JwtPayload = jwtService.decode(refreshTokenDto.refreshToken);

    if (!decoded?.sub) {
      throw new Error('Invalid refresh token');
    }

    return this.authService.refreshTokens(decoded.sub, refreshTokenDto.refreshToken);
  }

  /**
   * Logout user
   * POST /auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser('userId') userId: string): Promise<void> {
    return this.authService.logout(userId);
  }
}
