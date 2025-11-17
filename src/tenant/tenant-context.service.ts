import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private tenantId: string | null = null;

  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  getTenantId(): string | null {
    if (!this.tenantId) {
      throw new Error('Tenant ID has not been set.');
    }

    return this.tenantId;
  }
  hasTenantId(): boolean {
    return this.tenantId !== null;
  }
}
