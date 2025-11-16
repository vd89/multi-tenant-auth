import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITenantRepository } from '../interfaces/tenant-repository.interface';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { TenantEntity } from '../entities/tenant.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  async findOneBySubdomain(subdomain: string): Promise<TenantEntity | null> {
    try {
      return await this.tenantRepository.findOne({ where: { subdomain } });
    } catch (error: unknown) {
      throw new Error(`Method not implemented: ${(error as Error).message}`);
    }
  }
  async findById(id: string): Promise<TenantEntity | null> {
    try {
      return await this.tenantRepository.findOne({ where: { id } });
    } catch (error: unknown) {
      throw new Error(`Method not implemented: ${(error as Error).message}`);
    }
  }
  async createTenant(createTenantDto: CreateTenantDto): Promise<any> {
    try {
      const tenant = this.tenantRepository.create(createTenantDto);
      return await this.tenantRepository.save(tenant);
    } catch (error: unknown) {
      throw new Error(`Method not implemented: ${(error as Error).message}`);
    }
  }

  async findAllTenants(): Promise<TenantEntity[]> {
    try {
      return await this.tenantRepository.find({ order: { created_at: 'DESC' } });
    } catch (error: unknown) {
      throw new Error(`Method for getting all the tenants: ${(error as Error).message}`);
    }
  }

  async updatedTenant(id: string, updateData: Partial<TenantEntity>): Promise<TenantEntity> {
    try {
      await this.tenantRepository.update(id, updateData);
      const updatedTenant = await this.tenantRepository.findOne({ where: { id } });
      if (!updatedTenant) {
        throw new Error('Tenant not found after update.');
      }
      return updatedTenant;
    } catch (error: unknown) {
      throw new Error(`Method not implemented: ${(error as Error).message}`);
    }
  }

  async deleteTenant(id: string): Promise<void> {
    try {
      await this.tenantRepository.delete(id);
    } catch (error: unknown) {
      throw new Error(`Method not implemented: ${(error as Error).message}`);
    }
  }

  async existsBySubdomain(subdomain: string): Promise<boolean> {
    try {
      const count = await this.tenantRepository.count({ where: { subdomain } });
      return count > 0;
    } catch (error: unknown) {
      throw new Error(`Method not implemented: ${(error as Error).message}`);
    }
  }

  async findActiveTenantsCount(): Promise<number> {
    try {
      return await this.tenantRepository.count({ where: { is_active: true } });
    } catch (error: unknown) {
      throw new Error(`Method not implemented: ${(error as Error).message}`);
    }
  }
}
