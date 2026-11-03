import type { INestApplication } from '@nestjs/common';
import type { Request, Response } from 'express';
import redoc from 'redoc-express';

export const setupRedoc = (app: INestApplication) => {
  const redoc_options = {
    title: 'Library',
    specUrl: 'doc.yml',
  };

  app.use('/docs', redoc(redoc_options));

  app.use('/doc.yml', (_req: Request, res: Response) => {
    res.sendFile(`doc.yml`, { root: '.' });
  });
};
