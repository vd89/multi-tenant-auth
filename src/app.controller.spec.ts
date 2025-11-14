import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockTypeOrmHealthIndicator = {
    pingCheck: jest.fn(),
  };

  const mockMemoryHealthIndicator = {
    checkHeap: jest.fn(),
    checkRSS: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: mockTypeOrmHealthIndicator,
        },
        {
          provide: MemoryHealthIndicator,
          useValue: mockMemoryHealthIndicator,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return a standardized response with success message', () => {
      const result = appController.getHello();

      expect(result).toEqual({
        statusCode: 200,
        success: true,
        message: 'Hello World!',
      });
    });

    it('should return status code 200', () => {
      const result = appController.getHello();
      expect(result.statusCode).toBe(200);
    });

    it('should return success as true', () => {
      const result = appController.getHello();
      expect(result.success).toBe(true);
    });

    it('should return message "Hello World!"', () => {
      const result = appController.getHello();
      expect(result.message).toBe('Hello World!');
    });
  });

  describe('GET /app-info', () => {
    it('should return application information', () => {
      const result = appController.getAppInfo();

      expect(result).toEqual({
        appName: 'My NestJS Application',
        version: '1.0.0',
        description: 'This is a sample NestJS application.',
      });
    });

    it('should return correct app name', () => {
      const result = appController.getAppInfo();
      expect(result.appName).toBe('My NestJS Application');
    });

    it('should return correct version', () => {
      const result = appController.getAppInfo();
      expect(result.version).toBe('1.0.0');
    });

    it('should return correct description', () => {
      const result = appController.getAppInfo();
      expect(result.description).toBe('This is a sample NestJS application.');
    });
  });

  describe('GET /health', () => {
    it('should return health check result when all services are healthy', async () => {
      const mockHealthResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
      };

      mockHealthCheckService.check.mockResolvedValue(mockHealthResult);

      const result = await appController.checkHealth();

      expect(result).toEqual(mockHealthResult);
      expect(mockHealthCheckService.check).toHaveBeenCalledTimes(1);
    });

    it('should handle health check failures', async () => {
      const mockHealthResult = {
        status: 'error',
        info: {
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
        error: {
          database: { status: 'down', message: 'Connection failed' },
        },
        details: {
          database: { status: 'down', message: 'Connection failed' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
      };

      mockHealthCheckService.check.mockResolvedValue(mockHealthResult);

      const result = await appController.checkHealth();

      expect(result.status).toBe('error');
      expect(result.error).toHaveProperty('database');
    });

    it('should call appService.healthCheck method', async () => {
      const spy = jest.spyOn(appService, 'healthCheck');

      await appController.checkHealth();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
