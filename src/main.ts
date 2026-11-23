import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupRedoc } from './common/middlewares/redoc.middlewares';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Helmet con CSP personalizado:
  // - cross-origin resource policy para archivos servidos a la SPA
  // - script-src ampliado para permitir el bundle de Redoc desde unpkg.com
  // - font-src ampliado para las fuentes de Google Fonts que usa Redoc
  // - img-src ampliado para los logos y assets inline de Redoc
  // - worker-src para el web worker que usa Redoc internamente
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://unpkg.com', "'unsafe-inline'"],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          imgSrc: ["'self'", 'data:', 'https:'],
          workerSrc: ["'self'", 'blob:'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
    }),
  );

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
