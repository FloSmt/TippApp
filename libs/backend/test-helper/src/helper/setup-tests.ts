/* eslint-disable */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@tippapp/backend/core';
import cookieParser from 'cookie-parser';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

interface TestSetupResult {
  app: INestApplication;
  dataSource: DataSource;
  clientProxy?: ClientProxy;
}

export async function setupE2ETestEnvironment(setupMqtt?: boolean): Promise<TestSetupResult> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  let app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  if (setupMqtt) {
    app.connectMicroservice({
      transport: Transport.MQTT,
      options: {
        url: process.env['MQTT_BROKER_URL'],
        clean: true,
        connectTimeout: 5000,
      },
    });

    await app.startAllMicroservices();
  }

  await app.init();

  let dataSource = app.get(DataSource);

  if (setupMqtt) {
    let clientProxy = ClientProxyFactory.create({
      transport: Transport.MQTT,
      options: {
        url: process.env['MQTT_BROKER_URL'],
        clean: true,
      },
    });

    return {
      app: app,
      dataSource: dataSource,
      clientProxy: clientProxy,
    };
  }

  return {
    app: app,
    dataSource: dataSource,
  };
}
