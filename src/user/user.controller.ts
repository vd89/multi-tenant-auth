import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as jwtPayloadInterface from '../common/interfaces/jwt-payload.interface';
import { UserEntity } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get current user profile
   * Uses @CurrentUser decorator to get authenticated user
   */
  @Get('me')
  async getProfile(
    @CurrentUser() user: jwtPayloadInterface.IAuthenticatedUser,
  ): Promise<Partial<UserEntity> | null> {
    return this.userService.findById(user.userId);
  }

  /**
   * Get all users for current tenant
   */
  @Get('tenant')
  async getTenantUsers(@CurrentUser('tenantId') tenantId: string): Promise<Partial<UserEntity>[]> {
    return this.userService.findByTenantId(tenantId);
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<Partial<UserEntity> | null> {
    return this.userService.findById(id);
  }
}
