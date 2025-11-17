import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';
import { Observable } from 'rxjs';

// Define interface for the extended request
interface RequestWithTenantContext extends Request {
  tenantContext: TenantContextService;
}

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<RequestWithTenantContext>();
    request.tenantContext = this.tenantContext;
    return next.handle();
  }
}
