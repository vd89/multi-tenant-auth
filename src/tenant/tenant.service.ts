import { Injectable } from '@nestjs/common';
import { TenantEntity } from './entities/tenant.entity';
import { ConfigService } from '@nestjs/config';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as crypto from 'crypto';
import { TenantRepository } from './repositories/tenant.repository';

@Injectable()
export class TenantService {
  private readonly encryptionKey: string | undefined;
  private readonly algorithm: string = 'aes-256-cbc';

  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly configService: ConfigService,
  ) {
    this.encryptionKey = this.configService.get<string>('crypto.encryptionKey');
    if (!this.encryptionKey || this.encryptionKey.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be set and 32 characters long');
    }
  }

  async createTenant(dto: CreateTenantDto): Promise<Partial<TenantEntity>> {
    try {
      await this.validateUniqueSubdomain(dto.subdomain);
      const encryptedPassword = this.encryptPassword(dto.db_password);

      const tenantData = {
        ...dto,
        db_password: encryptedPassword,
      };
      const tenant = (await this.tenantRepository.createTenant(tenantData)) as TenantEntity;

      // Return partial tenant data without sensitive information
      const { db_password, ...partialTenant } = tenant;
      void db_password;
      return partialTenant;
    } catch (error: unknown) {
      throw new Error('Error in creating tenant: ' + (error as Error).message);
    }
  }

  /**
   * get tenant by subdomain
   * @param subdomain
   */

  async getTenantBySubdomain(subdomain: string): Promise<TenantEntity | null> {
    return this.tenantRepository.findOneBySubdomain(subdomain);
  }

  /**
   * Get Tenant by Id
   * @param id
   */

  async getTenantById(id: string): Promise<TenantEntity | null> {
    return this.tenantRepository.findById(id);
  }

  /**
   * Get All Tenants
   * @return TenantEntity[]
   */

  async getAllTenants(): Promise<TenantEntity[]> {
    return this.tenantRepository.findAllTenants();
  }

  /**
   * Update Tenant by Id
   * @param id
   * @param updateData
   */

  async updateTenant(id: string, updateData: Partial<TenantEntity>): Promise<TenantEntity> {
    return this.tenantRepository.updatedTenant(id, updateData);
  }

  /**
   * Delete Tenant by Id
   * @param id
   */
  async deleteTenant(id: string): Promise<void> {
    return this.tenantRepository.deleteTenant(id);
  }

  /**
   * Get Tenant Credentials by Subdomain
   * @param subdomain
   */
  async getTenantCredentialsBySubdomain(subdomain: string): Promise<Partial<TenantEntity> | null> {
    const tenant = await this.tenantRepository.findOneBySubdomain(subdomain);
    if (!tenant) {
      return null;
    }
    const decryptedPassword = this.decryptPassword(tenant.db_password);
    return {
      ...tenant,
      db_password: decryptedPassword,
    };
  }

  /**
   * this is to use the validation unique subdomain before creating a tenant
   * @param subdomain
   */
  private async validateUniqueSubdomain(subdomain: string): Promise<void> {
    /**
     * need to have the validation logic here to check if the subdomain already exists
     */
    const exists = await this.tenantRepository.existsBySubdomain(subdomain);
    if (exists) {
      throw new Error(`Subdomain '${subdomain}' is already in use.`);
    }
  }

  /**
   * Encrypts Password using AES-256-CBC
   * @param password
   * @returns encrypted password
   */

  private encryptPassword(password: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.encryptionKey!), iv);
    const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * Decrypts Password using AES-256-CBC
   * @param encryptedPassword
   * @returns decrypted password
   */
  private decryptPassword(encryptedPassword: string): string {
    const [ivHex, encryptedHex] = encryptedPassword.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.encryptionKey!), iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
  }
}
