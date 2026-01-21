import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true });

  const rawBodySaver = (req: any, _res: any, buf: Buffer) => {
    if (buf?.length) {
      req.rawBody = buf.toString('utf8');
    }
  };

  // Aumenta o limite de tamanho do corpo das requisições
  // para suportar imagens base64 em campanhas
  app.use(
    json({
      limit: '10mb',
      verify: rawBodySaver
    })
  );
  app.use(
    urlencoded({
      limit: '10mb',
      extended: true,
      verify: rawBodySaver
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  console.log(`Backend ready on port ${port}`);
}

bootstrap();
