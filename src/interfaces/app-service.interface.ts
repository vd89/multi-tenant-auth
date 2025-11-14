import { HealthCheckResult } from '@nestjs/terminus';
import { IAppResponse, IAppInfo } from './app-response.interface';

export interface IAppService {
  getHello(): IAppResponse;
  getAppInfo(): IAppInfo;
  healthCheck(): Promise<HealthCheckResult>;
}
