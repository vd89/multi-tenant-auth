import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as userRepositoryInterface from './interfaces/user-repository.interface';
import * as bcrypt from 'bcrypt';

/**
 * USER SERVICE
 *
 * DEPENDENCY INJECTION PATTERN:
 * - Inject interface (IUserRepository) not implementation
 * - Allows easy testing with mock repository
 * - Follows Dependency Inversion Principle
 */

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: userRepositoryInterface.IUserRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<Partial<UserEntity>> {
    // Check if email already exists
    const exists = await this.userRepository.existsByEmail(createUserDto.email);
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.userRepository.create({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      password: hashedPassword,
    });

    // Return without sensitive data
    const { password, refresh_token, ...result } = user;
    void password;
    void refresh_token;
    return result;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email.toLowerCase());
  }

  async findById(id: string): Promise<Partial<UserEntity | null>> {
    return this.userRepository.findById(id);
  }

  async findByTenantId(tenant_id: string): Promise<Partial<UserEntity>[]> {
    const users = await this.userRepository.findByTenantId(tenant_id);
    // Remove sensitive data
    return users.map(({ password, refresh_token, ...user }) => {
      void password;
      void refresh_token;
      return user;
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    // Hash refresh token before storing
    const hashedToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.userRepository.updateRefreshToken(userId, hashedToken);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.updateLastLogin(userId);
  }

  async validateRefreshToken(userId: string, refresh_token: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.refresh_token) {
      return false;
    }
    return bcrypt.compare(refresh_token, user.refresh_token);
  }

  async getUserForAuth(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user as UserEntity;
  }
}
