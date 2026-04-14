import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = Number(process.env.PORT || 3000);
  const publicDir = path.join(process.cwd(), 'frontend');

  app.enableCors();
  app.useStaticAssets(publicDir);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  await app.listen(port, '0.0.0.0');
  console.log(`\nResume Matcher Nest API running at http://localhost:${port}`);
  console.log(`API docs: http://localhost:${port}/api/docs\n`);
}

bootstrap();
