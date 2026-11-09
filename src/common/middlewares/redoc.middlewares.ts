import type { INestApplication } from '@nestjs/common';
import type { Request, Response } from 'express';
import { join } from 'path';
import redoc from 'redoc-express';

export const setupRedoc = (app: INestApplication) => {
  const redoc_options = {
    title: 'Library',
    specUrl: '/doc.yml',
  };

  app.use('/docs', redoc(redoc_options));

  app.use('/doc.yml', (_req: Request, res: Response) => {
    // Try multiple paths to find doc.yml
    const paths = [
      join(process.cwd(), 'doc.yml'),
      join(__dirname, '..', '..', 'doc.yml'),
      join(__dirname, 'doc.yml'),
    ];
    
    for (const path of paths) {
      try {
        res.sendFile(path);
        return;
      } catch {
        // Try next path
      }
    }
    
    res.status(404).send('Documentation file not found');
  });
};


