import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResponseInterceptor } from './interceptors/response.interceptor';

/**
 * COMMON MODULE
 *
 * PURPOSE:
 * - Break circular dependencies between Auth and User modules
 * - Provide shared guards, decorators, and interfaces
 * - Single registration of JwtModule
 *
 * WHY GLOBAL?
 * - Guards and interceptors need JwtService and ConfigService
 * - Avoid importing CommonModule everywhere
 * - JwtModule is configured once here
 *
 * CIRCULAR DEPENDENCY SOLUTION:
 * Before: AuthModule ↔ UserModule (circular)
 * After:  AuthModule → CommonModule ← UserModule (no circular)
 */

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn', '1h'),
        },
      }),
    }),
  ],
  providers: [JwtAuthGuard, ResponseInterceptor],
  exports: [JwtModule, JwtAuthGuard, ResponseInterceptor],
})
export class CommonModule {}
