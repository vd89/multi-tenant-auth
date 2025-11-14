import { Injectable } from '@nestjs/common';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { IAppService } from './interfaces/app-service.interface';
import { IAppInfo, IAppResponse } from './interfaces/app-response.interface';

@Injectable()
export class AppService implements IAppService {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  getHello(): IAppResponse {
    return {
      statusCode: 200,
      success: true,
      message: 'Hello World!',
    };
  }

  getAppInfo(): IAppInfo {
    return {
      name: 'Multi-Tenant Auth API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }

  healthCheck(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
  }
}
