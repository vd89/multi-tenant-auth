import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

// Type definitions for better type safety
interface AppInfoResponse {
  name: string;
  version: string;
  status: string;
  timestamp: string;
}

interface HealthCheckResponse {
  status: string;
  info: Record<string, unknown>;
  error: Record<string, unknown>;
  details: Record<string, unknown>;
}

interface HelloResponse {
  statusCode: number;
  success: boolean;
  message: string;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  // Mock health check services for E2E tests
  const mockHealthCheckService = {
    check: jest.fn().mockResolvedValue({
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
    }),
  };

  const mockTypeOrmHealthIndicator = {
    pingCheck: jest.fn().mockReturnValue({ database: { status: 'up' } }),
  };

  const mockMemoryHealthIndicator = {
    checkHeap: jest.fn().mockReturnValue({ memory_heap: { status: 'up' } }),
    checkRSS: jest.fn().mockReturnValue({ memory_rss: { status: 'up' } }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HealthCheckService)
      .useValue(mockHealthCheckService)
      .overrideProvider(TypeOrmHealthIndicator)
      .useValue(mockTypeOrmHealthIndicator)
      .overrideProvider(MemoryHealthIndicator)
      .useValue(mockMemoryHealthIndicator)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return Hello World response', () => {
      return request(app.getHttpServer()).get('/').expect(200).expect({
        statusCode: 200,
        success: true,
        message: 'Hello World!',
      });
    });

    it('should have correct response headers', () => {
      return request(app.getHttpServer()).get('/').expect(200).expect('Content-Type', /json/);
    });
  });

  describe('GET /app-info', () => {
    it('should return application information', () => {
      return request(app.getHttpServer())
        .get('/app-info')
        .expect(200)
        .then((res) => {
          const body = res.body as AppInfoResponse;
          expect(body).toEqual(
            expect.objectContaining({
              name: 'Multi-Tenant Auth API',
              version: '1.0.0',
              status: 'running',
              timestamp: expect.any(String) as string,
            }),
          );

          // validate timestamp is a valid ISO date
          expect(isNaN(Date.parse(body.timestamp))).toBe(false);
        });
    });

    it('should have correct response structure', () => {
      return request(app.getHttpServer())
        .get('/app-info')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('version');
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('GET /health', () => {
    it('should return health check status when all services are healthy', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          const body = res.body as HealthCheckResponse;
          expect(body).toHaveProperty('status', 'ok');
          expect(body).toHaveProperty('info');
          expect(body).toHaveProperty('error');
          expect(body).toHaveProperty('details');
        });
    });

    it('should check all required health indicators', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          const body = res.body as HealthCheckResponse;
          expect(body.details).toHaveProperty('database');
          expect(body.details).toHaveProperty('memory_heap');
          expect(body.details).toHaveProperty('memory_rss');
        });
    });

    it('should return proper content type', () => {
      return request(app.getHttpServer()).get('/health').expect(200).expect('Content-Type', /json/);
    });
  });

  describe('API Response Format Consistency', () => {
    it('should maintain consistent response format for success endpoints', async () => {
      const response = await request(app.getHttpServer()).get('/');
      const body = response.body as HelloResponse;

      expect(body).toMatchObject({
        statusCode: expect.any(Number) as number,
        success: expect.any(Boolean) as boolean,
        message: expect.any(String) as string,
      });
    });

    it('should return proper JSON for all endpoints', async () => {
      const endpoints = ['/', '/app-info', '/health'];

      for (const endpoint of endpoints) {
        const response = await request(app.getHttpServer()).get(endpoint);
        expect(response.headers['content-type']).toMatch(/application\/json/);
      }
    });
  });
});
