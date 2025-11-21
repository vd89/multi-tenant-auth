import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantService } from '../../tenant/tenant.service';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { Request } from 'express';

/**
 * TENANT CONTEXT GUARD
 *
 * PURPOSE:
 * - Extract tenant identifier from request
 * - Validate tenant exists and is active
 * - Set tenant context for downstream use
 *
 * EXECUTION ORDER:
 * Guards execute in the order they're applied:
 * @UseGuards(TenantContextGuard, JwtAuthGuard)
 *
 * TENANT EXTRACTION STRATEGIES:
 * 1. Header: X-Tenant-ID
 * 2. Subdomain: tenant1.api.example.com
 * 3. Query param: ?tenantId=xxx (not recommended for production)
 */

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(
    private readonly tenantService: TenantService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public - still extract tenant if available
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();

    // Extract tenant identifier
    const tenantIdentifier = this.extractTenantIdentifier(request);

    // For public routes without tenant, allow access
    if (!tenantIdentifier && isPublic) {
      return true;
    }

    // For protected routes, tenant is required
    if (!tenantIdentifier) {
      throw new BadRequestException(
        'Tenant identifier required. Provide X-Tenant-ID header or use subdomain.',
      );
    }

    // Fetch tenant and validate
    const tenant = await this.tenantService.getTenantCredentialsBySubdomain(tenantIdentifier);

    if (!tenant) {
      throw new NotFoundException(`Tenant '${tenantIdentifier}' not found`);
    }

    if (!tenant.is_active) {
      throw new BadRequestException(`Tenant '${tenantIdentifier}' is inactive`);
    }

    // Set tenant context on request
    request.tenantContext = {
      tenantId: tenant.id!,
      subdomain: tenant.subdomain!,
      dbConfig: {
        host: tenant.db_host!,
        port: tenant.db_port!,
        username: tenant.db_username!,
        password: tenant.db_password!, // Decrypted by TenantService
        database: tenant.db_name!,
      },
    };

    return true;
  }

  private extractTenantIdentifier(request: Request): string | null {
    // Strategy 1: Header
    const headerTenant = request.headers['x-tenant-id'] as string;
    if (headerTenant) {
      return headerTenant;
    }

    // Strategy 2: Subdomain
    const host = request.headers.host || '';
    const subdomain = this.extractSubdomain(host);
    if (subdomain) {
      return subdomain;
    }

    // Strategy 3: Query param (for development/testing only)
    const queryTenant = request.query['tenantId'] as string;
    if (queryTenant) {
      return queryTenant;
    }

    return null;
  }

  private extractSubdomain(host: string): string | null {
    // Remove port if present
    const hostname = host.split(':')[0];
    const parts = hostname.split('.');

    // Need at least 3 parts: subdomain.domain.tld
    // Example: tenant1.api.example.com → tenant1
    if (parts.length >= 3) {
      const subdomain = parts[0];
      // Exclude common non-tenant subdomains
      if (!['www', 'api', 'app', 'admin'].includes(subdomain)) {
        return subdomain;
      }
    }

    return null;
  }
}
