import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { TenantContextGuard } from './guards/tenant-context.guard';
import { TenantModule } from '../tenant/tenant.module';

/**
 * AUTH MODULE
 *
 * CIRCULAR DEPENDENCY SOLUTIONS DEMONSTRATED:
 *
 * 1. forwardRef():
 *    - Used for UserModule import
 *    - Delays module resolution
 *    - Last resort solution
 *
 * 2. Common Module (PREFERRED):
 *    - Guards moved to CommonModule
 *    - Breaks the cycle completely
 *    - Clean architecture
 *
 * 3. Event-based decoupling:
 *    - Not shown here, but useful for complex scenarios
 *    - Example: emit 'user.created' event instead of calling service
 *
 * WHY PASSPORT MODULE?
 * - Standardized authentication
 * - Strategy pattern for different auth methods
 * - Easy to add OAuth, Local, etc.
 */

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UserModule), // Solution #1: forwardRef
    TenantModule, // For TenantContextGuard
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TenantContextGuard],
  exports: [AuthService, TenantContextGuard],
})
export class AuthModule {}
