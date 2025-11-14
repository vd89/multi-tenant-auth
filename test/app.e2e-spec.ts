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
      imports: [ AppModule ],
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
      return request(app.getHttpServer()).get('/app-info').expect(200).expect({
        appName: 'My NestJS Application',
        version: '1.0.0',
        description: 'This is a sample NestJS application.',
      });
    });

    it('should have correct response structure', () => {
      return request(app.getHttpServer())
        .get('/app-info')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('appName');
          expect(res.body).toHaveProperty('version');
          expect(res.body).toHaveProperty('description');
        });
    });
  });

  describe('GET /health', () => {
    it('should return health check status when all services are healthy', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('info');
          expect(res.body).toHaveProperty('error');
          expect(res.body).toHaveProperty('details');
        });
    });

    it('should check all required health indicators', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.details).toHaveProperty('database');
          expect(res.body.details).toHaveProperty('memory_heap');
          expect(res.body.details).toHaveProperty('memory_rss');
        });
    });

    it('should return proper content type', () => {
      return request(app.getHttpServer()).get('/health').expect(200).expect('Content-Type', /json/);
    });
  });

  describe('API Response Format Consistency', () => {
    it('should maintain consistent response format for success endpoints', async () => {
      const response = await request(app.getHttpServer()).get('/');

      expect(response.body).toMatchObject({
        statusCode: expect.any(Number),
        success: expect.any(Boolean),
        message: expect.any(String),
      });
    });

    it('should return proper JSON for all endpoints', async () => {
      const endpoints = [ '/', '/app-info', '/health' ];

      for (const endpoint of endpoints) {
        const response = await request(app.getHttpServer()).get(endpoint);
        expect(response.headers[ 'content-type' ]).toMatch(/application\/json/);
      }
    });
  });
});
