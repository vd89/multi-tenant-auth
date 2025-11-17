import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { TenantRepository } from './repositories/tenant.repository';
import { TenantController } from './tenant.controller';
import { TenantContextService } from './tenant-context.service';
import { TenantMiddleware } from './tenant.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenantInterceptor } from './tenant.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  controllers: [TenantController],
  providers: [
    TenantService,
    TenantRepository,
    TenantContextService,
    {
      provide: 'ITenantRepository',
      useClass: TenantRepository,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
  exports: [TenantService, 'ITenantRepository', TenantContextService],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'api/v1/health', method: RequestMethod.GET },
        { path: 'api/v1/auth/login', method: RequestMethod.POST },
        { path: 'api/v1/auth/register', method: RequestMethod.POST },
        { path: 'api/v1/auth/refresh', method: RequestMethod.POST },
        // Tenant creation endpoint (bootstrapping - no tenant exists yet)
        { path: 'api/v1/tenant', method: RequestMethod.POST },
        // Public endpoints for listing/getting tenants (for admin purposes)
        { path: 'api/v1/tenant', method: RequestMethod.GET },
        { path: 'api/v1/tenant/:subdomain', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
