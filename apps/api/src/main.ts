import 'reflect-metadata';
import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { ValidationError } from 'class-validator';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

type LambdaHandler = (event: APIGatewayProxyEventV2, context: Context) => Promise<APIGatewayProxyResultV2>;

type ServerlessExpressHandler = (event: APIGatewayProxyEventV2, context: Context) => Promise<APIGatewayProxyResultV2>;

let server: ServerlessExpressHandler;

function setupApp(app: INestApplication) {
  const frontendOrigin = process.env.FRONTEND_ORIGIN?.trim();

  app.enableCors({
    // In Lambda we often don't know the final frontend URL at bootstrap time.
    // Using `true` reflects the request origin and keeps credentialed CORS working.
    origin: frontendOrigin || true,
    credentials: true,
  });
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Booktracker API')
    .setDescription('API documentation for Booktracker backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  return app;
}

export const handler: LambdaHandler = async (event: APIGatewayProxyEventV2, context: Context) => {
  if (!server) {
    const app = await NestFactory.create(AppModule);
    setupApp(app);
    await app.init();
    const expressApp: unknown = app.getHttpAdapter().getInstance();
    server = serverlessExpress({
      app: expressApp as Parameters<typeof serverlessExpress>[0]['app'],
    }) as unknown as ServerlessExpressHandler;
  }

  return server(event, context);
};

if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    setupApp(app);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3001);
    await app.listen(port);
  }
  void bootstrap();
}
