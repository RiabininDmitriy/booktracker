import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { ValidationError } from 'class-validator';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { App } from 'supertest/types';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

export async function createTestApp(): Promise<INestApplication<App>> {
  // Ensure ConfigModule validation passes in Jest environment.
  process.env.NODE_ENV = 'development';
  process.env.JWT_SECRET ??= 'test_jwt_secret';
  process.env.DATABASE_URL ??=
    'postgresql://postgres:postgres@localhost:5433/booktracker';

  // Import after env is set (Jest sets NODE_ENV=test by default).
  // Jest in this repo runs in CJS mode, so we use require() instead of dynamic import().
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const appModule = require('../../src/app.module') as {
    AppModule: new (...args: never[]) => unknown;
  };

  const moduleRef = await Test.createTestingModule({
    imports: [appModule.AppModule],
  })
    .overrideProvider(HttpService)
    .useValue({
      get: jest.fn().mockImplementation(() => of({ data: { docs: [] } })),
    })
    .compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>();

  // Mirror main.ts so e2e behavior matches runtime behavior.
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
      exceptionFactory: (errors: ValidationError[]) => {
        const details = errors.map((e) => ({
          field: e.property,
          messages: Object.values(e.constraints ?? {}),
        }));
        return new BadRequestException({
          message: 'Validation failed',
          details,
        });
      },
    }),
  );

  // Mirror Swagger setup from main.ts for docs smoke tests.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Booktracker API')
    .setDescription('API documentation for Booktracker backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.init();
  return app;
}
