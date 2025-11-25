import { Injectable } from '@nestjs/common';

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
    <p><a href="/app">Health Check</a></p>
    <p><a href="/docs">Documentação</a></p>
    <p><a href="/api/v1/health">App Web</a></p>
  </body>
</html>`;
  }
}
