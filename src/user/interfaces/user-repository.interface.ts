import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  create(createUserDto: CreateUserDto): Promise<Partial<UserEntity>>;
  findByEmail(email: string): Promise<Partial<UserEntity | null>>;
  findById(id: string): Promise<Partial<UserEntity | null>>;
  findByTenantId(tenant_id: string): Promise<Partial<UserEntity[] | null>>;
  updatedRefreshToken(userId: string, refresh_token: string | null): Promise<void>;
  updateLastLogin(userId: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}
