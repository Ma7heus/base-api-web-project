import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import database from '../database/dbconnect';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const API_PREFIX = process.env.API_PREFIX || 'api/v1';
const CORS_ORIGINS = process.env.CORS_ORIGINS || '';
const PORT = process.env.PORT || 3000;

const swaggerConfig = new DocumentBuilder()
  .setTitle('App base API')
  .setDescription('API base para projetos em NestJS')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('Auth', 'Autenticação de usuários')
  .addTag('status', 'Verificação de status da API')
  .build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //CONFIGURANDO HELMET (HEADERS DE SEGURANÇA)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  //CONFIGURANDO VALIDATION PIPE GLOBAL
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  //CONFIGURANDO CORS
  app.enableCors({
    origin: CORS_ORIGINS,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  //CONFIGURANDO PREFIXO GLOBAL
  app.setGlobalPrefix(API_PREFIX);

  //TESTANDO CONEXÃO COM O BANCO DE DADOS
  await database.initDatabase();

  //CONFIGURANDO SWAGGER
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  //RODANDO API
  await app.listen(PORT);
  console.log('\n************************************************');
  console.log(`API running at http://localhost:${PORT}/${API_PREFIX}/`);
  console.log(`Swagger documentation at http://localhost:${PORT}/api/docs`);
  console.log('************************************************');
}

void bootstrap();
