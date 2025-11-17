import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';
import { TenantService } from './tenant.service';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly tenantService: TenantService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const tenantIdentifier = this.extractTenantIdentifier(req);
    if (!tenantIdentifier) {
      throw new UnauthorizedException('Tenant identifier is missing in the request.');
    }
    const tenant = await this.tenantService.getTenantBySubdomain(tenantIdentifier);
    if (!tenant) {
      throw new UnauthorizedException(`Tenant '${tenantIdentifier}' not found.`);
    }
    if (!tenant.is_active) {
      throw new UnauthorizedException(`Tenant '${tenantIdentifier}' is not active.`);
    }
    this.tenantContext.setTenantId(tenant.id);
    req['tenant'] = tenant; // Attach tenant info to request object
    next();
  }

  private extractTenantIdentifier(req: Request): string | null {
    const headerTenant = req.headers['x-tenant-id'] as string | undefined;
    if (headerTenant) {
      return headerTenant;
    }
    const hostName = req.hostname; // e.g., tenant1.example.com
    const parts = hostName.split('.');
    if (parts.length < 3) {
      return null; // No subdomain present
    }
    const subdomain = this.extractSubdomain(hostName);
    if (subdomain) {
      return subdomain;
    }

    const queryTenant = req.query.tenant as string | undefined;
    if (queryTenant && process.env.NODE_ENV === 'development') {
      return queryTenant;
    }

    return null; // No tenant identifier found
  }

  private extractSubdomain(hostName: string): string | null {
    if (hostName === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostName)) {
      return null;
    }

    // Split hostname: "tenant1.yourapp.com" -> ["tenant1", "yourapp", "com"]
    const parts = hostName.split('.');

    // Need at least subdomain.domain.tld (3 parts)
    if (parts.length < 3) {
      return null;
    }

    // Return first part as subdomain
    return parts[0];
  }
}
