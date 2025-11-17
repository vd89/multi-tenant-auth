import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContextService } from '../tenant-context.service';

// Define interface for the extended request (same as in interceptor)
interface RequestWithTenantContext extends Request {
  tenantContext: TenantContextService;
}

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithTenantContext>();
    const tenantContext = request.tenantContext;
    if (!tenantContext) {
      throw new Error('TenantContextService is not available in the request.');
    }
    const tenantId = tenantContext.getTenantId();
    return tenantId;
  },
);
