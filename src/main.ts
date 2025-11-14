import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const { port, apiPrefix } = configService.appConfig;

    app.setGlobalPrefix(apiPrefix);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Strip properties that do not have any decorators
        forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
        transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
        transformOptions: {
          enableImplicitConversion: true, // Enable implicit type conversion based on the DTO types
        },
      }),
    );

    app.enableCors();

    await app.listen(port);
    logger.log(`Environment: ${process.env.ENVIRONMENT ?? 'production'}`);

    logger.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  } catch (error) {
    logger.error('Error during application bootstrap', error);
    process.exit(1);
  }
}

void bootstrap();
