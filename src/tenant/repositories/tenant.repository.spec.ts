import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantRepository } from './tenant.repository';
import { TenantEntity } from '../entities/tenant.entity';
import { CreateTenantDto } from '../dto/create-tenant.dto';

// Create a proper mock type
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('TenantRepository', () => {
  let tenantRepository: TenantRepository;
  let mockRepository: MockRepository<TenantEntity>;

  beforeEach(async () => {
    // Create the mock repository
    mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantRepository,
        {
          provide: getRepositoryToken(TenantEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    tenantRepository = module.get<TenantRepository>(TenantRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findBySubdomain', () => {
    it('should return tenant when found', async () => {
      const mockTenant = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Tenant',
        subdomain: 'test-tenant',
        db_host: 'localhost',
        db_port: 5432,
        db_username: 'test_user',
        db_password: 'encrypted_password',
        db_name: 'test_db',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      } as TenantEntity;
      mockRepository.findOne?.mockResolvedValue(mockTenant);

      const result = await tenantRepository.findOneBySubdomain('test-tenant');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { subdomain: 'test-tenant' },
      });
      expect(result).toEqual(mockTenant);
    });

    it('should return null when tenant not found', async () => {
      mockRepository.findOne?.mockResolvedValue(null);

      const result = await tenantRepository.findOneBySubdomain('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a new tenant', async () => {
      const createTenantDto: CreateTenantDto = {
        name: 'Test Tenant',
        subdomain: 'test-tenant',
        db_host: 'localhost',
        db_port: 5432,
        db_username: 'test_user',
        db_password: 'test_password',
        db_name: 'test_db',
      };

      const mockTenant = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Tenant',
        subdomain: 'test-tenant',
        db_host: 'localhost',
        db_port: 5432,
        db_username: 'test_user',
        db_password: 'encrypted_password',
        db_name: 'test_db',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      } as TenantEntity;

      mockRepository.create?.mockReturnValue(mockTenant);
      mockRepository.save?.mockResolvedValue(mockTenant);

      const result = (await tenantRepository.createTenant(createTenantDto)) as TenantEntity;

      expect(mockRepository.create).toHaveBeenCalledWith(createTenantDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTenant);
      expect(result).toEqual(mockTenant);
    });
  });

  describe('exists', () => {
    it('should return true when tenant exists', async () => {
      mockRepository.count?.mockResolvedValue(1);

      const result = await tenantRepository.existsBySubdomain('test-tenant');

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { subdomain: 'test-tenant' },
      });
      expect(result).toBe(true);
    });

    it('should return false when tenant does not exist', async () => {
      mockRepository.count?.mockResolvedValue(0);

      const result = await tenantRepository.existsBySubdomain('non-existent');

      expect(result).toBe(false);
    });
  });
});
