import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupRedoc } from './common/middlewares/redoc.middlewares';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Files are served cross-origin to the SPA, so the resource policy must allow it.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  const origins = (
    process.env.CORS_ORIGIN ?? 'http://localhost:4200,http://localhost:4210'
  )
    .split(',')
    .map((o) => o.trim());
  app.enableCors({ origin: origins });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  setupRedoc(app);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
