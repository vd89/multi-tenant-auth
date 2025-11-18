import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
// import { AuthModule } from '../auth/auth.module';

/**
 * USER MODULE
 *
 * CIRCULAR DEPENDENCY SOLUTION #1: forwardRef()
 *
 * WHY CIRCULAR DEPENDENCY EXISTS:
 * - UserModule needs AuthModule for guards (if using Passport)
 * - AuthModule needs UserModule for UserService
 *
 * HOW forwardRef() WORKS:
 * - Delays resolution of the module reference
 * - NestJS resolves it after both modules are instantiated
 * - Use sparingly - it's often an architectural smell
 *
 * BETTER SOLUTION (already implemented):
 * - Move guards to CommonModule
 * - UserModule doesn't need to import AuthModule directly
 */

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    // forwardRef() only needed if UserModule uses something from AuthModule
    // Since we moved guards to CommonModule, this might not be needed
    // Keeping it here for demonstration purposes
    // forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: [UserService, 'IUserRepository'],
})
export class UserModule {}
