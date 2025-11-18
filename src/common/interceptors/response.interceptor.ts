import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppResponse } from '../../interfaces/app-response.interface';

interface RequestWithTenantContext extends Request {
  tenantContext?: {
    tenantId: string;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, AppResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<AppResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithTenantContext>();
    const response = ctx.getResponse<Response>();

    const tenantContext = request['tenantContext'] as
      | {
          tenantId?: string;
        }
      | undefined;

    if (tenantContext?.tenantId) {
      response.setHeader('X-Tenant-ID', String(tenantContext.tenantId));
    }

    return next.handle().pipe(
      map((data) => {
        const url = request.url;
        const tenantId = tenantContext?.tenantId;

        return {
          statusCode: response.statusCode,
          success: true,
          data: data as T,
          timestamp: new Date().toISOString(),
          path: url,
          ...(tenantId && { tenantId }),
        };
      }),
    );
  }
}
