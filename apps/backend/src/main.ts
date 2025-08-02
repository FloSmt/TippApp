/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {Logger, ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {AppModule} from "@tippapp/backend/core";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors({
    credentials: true,
    origin: [
      'http://localhost:4200',        // Angular Entwicklungs-Server
      'http://localhost',             // Ionic Android App (Capacitor)
      'capacitor://localhost',        // Ionic iOS App (Capacitor)
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


  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
