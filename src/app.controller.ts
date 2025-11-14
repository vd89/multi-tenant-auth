import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthCheck } from '@nestjs/terminus';
import * as appResponseInterface from './interfaces/app-response.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @HealthCheck()
  checkHealth() {
    return this.appService.healthCheck();
  }

  @Get()
  getHello(): appResponseInterface.IAppResponse {
    return this.appService.getHello();
  }

  @Get('app-info')
  getAppInfo(): appResponseInterface.IAppInfo {
    return this.appService.getAppInfo();
  }
}
