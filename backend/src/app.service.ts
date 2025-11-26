import { Injectable } from '@nestjs/common';
import database from '../database/dbconnect';

const API_PREFIX = process.env.API_PREFIX || 'api/v1';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

@Injectable()
export class AppService {
  getHello(): string {
    return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>Base API Web Project</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 2rem; }
      a { color: #0366d6; text-decoration: none; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <h1>Bem-vindo à Base API Web Project!</h1>
    <p><a href="/${API_PREFIX}/status">Health Check</a></p>
    <p><a href="/api/docs">Documentação</a></p>
    <p><a href="${FRONTEND_URL}">App Web</a></p>
  </body>
</html>`;
  }

  async getStatus(): Promise<any> {
    const status = {
      status: 'ok',
      database: {
        name: await database.databaseName(),
        databaseVersion: await database.getDatabaseVersion(),
        maxConnections: await database.maxConnections(),
        currentConnections: await database.getConnections(),
        applied_migrations: await database.countAppliedMigrations(),
        migrations: await database.executeQuery('SELECT * FROM migrations'),
      },
    };

    return status;
  }
}
