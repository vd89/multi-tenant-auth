import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { TenantRepository } from './repositories/tenant.repository';
import { TenantController } from './tenant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  controllers: [TenantController],
  providers: [
    TenantService,
    TenantRepository,
    {
      provide: 'ITenantRepository',
      useClass: TenantRepository,
    },
  ],
  exports: [TenantService, 'ITenantRepository'],
})
export class TenantModule {}
