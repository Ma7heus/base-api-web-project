import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
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
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Insira o token JWT',
      in: 'header',
    },
    'JWT-auth',
  )
  .addTag('auth', 'Autenticação de usuários')
  .addTag('status', 'Verificação de status da API')
  .build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

bootstrap();
