import { CreateTenantDto } from '../dto/create-tenant.dto';
import { TenantEntity } from '../entities/tenant.entity';

export interface ITenantRepository {
  findOneBySubdomain(subdomain: string): Promise<any>;
  findById(id: string): Promise<TenantEntity | null>;
  createTenant(createTenantDto: CreateTenantDto): Promise<any>;
  findAllTenants(): Promise<TenantEntity[]>;
  updatedTenant(id: string, updateData: Partial<TenantEntity>): Promise<TenantEntity>;
  deleteTenant(id: string): Promise<void>;
  existsBySubdomain(subdomain: string): Promise<boolean>;
  findActiveTenantsCount(): Promise<number>;
}
