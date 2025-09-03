/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as process from 'node:process';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, HttpValidationFilter } from '@tippapp/backend/core';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  console.log('Process Env', process.env.LOCAL_IP_ADDRESS);
  app.enableCors({
    credentials: true,
    origin: [
      'http://localhost:4200', // Angular Entwicklungs-Server
      'http://localhost', // Ionic Android App (Capacitor)
      'capacitor://localhost',
      'http://' + process.env.LOCAL_IP_ADDRESS, // Ionic iOS App (Capacitor)
      // Weitere Produktions-Ursprünge (deine Live-Domains)
    ],
  });
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('TippApp - Backend API')
    .setDescription('')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        return new BadRequestException(errors);
      },
    })
  );

  app.useGlobalFilters(new HttpValidationFilter());

  const port = process.env.PORT || 3000;
  if (process.env.MOBILE_TEST === 'true') {
    // Nur für mobile Tests mit dem Ionic DevApp
    await app.listen(3000, process.env.LOCAL_IP_ADDRESS);
    Logger.log(
      `🚀 Application is running on: http://${process.env.LOCAL_IP_ADDRESS}:${port}/${globalPrefix}`
    );
  } else {
    await app.listen(port);
    Logger.log(
      `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
    );
  }
}

bootstrap();
