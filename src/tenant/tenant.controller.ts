import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantEntity } from './entities/tenant.entity';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * Create Tenant
   * @param CreateTenantDto
   * @return Partial<TenantEntity>
   * POST /tenant
   *
   */

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTenant(@Body() createTenantDto: CreateTenantDto): Promise<Partial<TenantEntity>> {
    return this.tenantService.createTenant(createTenantDto);
  }

  /**
   * Get Tenant by Subdomain
   * @param subdomain
   * GET /tenant/:subdomain
   */
  @Get(':subdomain')
  @HttpCode(HttpStatus.OK)
  async getTenantBySubdomain(
    @Param('subdomain') subdomain: string,
  ): Promise<Partial<TenantEntity> | null> {
    return this.tenantService.getTenantBySubdomain(subdomain);
  }
  /**
   * Get Tenant by Id
   * @param id
   * GET /tenant/id/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTenantById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Partial<TenantEntity> | null> {
    return this.tenantService.getTenantById(id);
  }

  /**
   * Get All Tenants
   * GET /tenant
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTenants(): Promise<Partial<TenantEntity>[]> {
    return this.tenantService.getAllTenants();
  }

  /**
   * Update Tenant
   * @param id
   * @param updateData
   * PUT /tenant/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateTenant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<TenantEntity>,
  ): Promise<Partial<TenantEntity>> {
    return this.tenantService.updateTenant(id, updateData);
  }

  /**
   * Delete Tenant
   * @param id
   * DELETE /tenant/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTenant(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tenantService.deleteTenant(id);
  }
}
