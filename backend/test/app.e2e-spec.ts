import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status');
        expect(res.body.status).toBe('ok');
      });
  });

  it('/api/jobs (GET) - should return paginated jobs', () => {
    return request(app.getHttpServer())
      .get('/api/jobs')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('jobs');
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('page');
        expect(Array.isArray(res.body.jobs)).toBe(true);
      });
  });

  it('/api/jobs (GET) - should support pagination', () => {
    return request(app.getHttpServer())
      .get('/api/jobs?page=1&limit=5')
      .expect(200)
      .expect((res) => {
        expect(res.body.page).toBe(1);
        expect(res.body.limit).toBe(5);
        expect(res.body.jobs.length).toBeLessThanOrEqual(5);
      });
  });
});
