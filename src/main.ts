import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ origin: 'http://localhost:3000', credentials: true }); // 다른 주소로부터 데이터를 받기 위함 upload
  app.useGlobalPipes();
  await app.listen(4000);
}
bootstrap();
