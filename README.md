# test-api-web-project

Monorepo contendo uma aplicação Angular (frontend) e NestJS (backend) com Jest configurado para testes.

## Estrutura do Projeto

```
test-api-web-project/
├── backend/          # API NestJS
├── frontend/         # Aplicação Angular
└── package.json      # Scripts do monorepo
```

## Pré-requisitos

- Node.js (versão 18+)
- npm

## Instalação

Instalar dependências de ambas as aplicações:

```bash
npm run install:all
```

Ou individualmente:

```bash
npm run install:backend
npm run install:frontend
```

## Scripts Disponíveis

### Desenvolvimento

- `npm run start:backend` - Inicia o backend em modo de desenvolvimento (porta 3000)
- `npm run start:frontend` - Inicia o frontend em modo de desenvolvimento (porta 4200)
- `npm run start:both` - Inicia ambas as aplicações simultaneamente

### Build

- `npm run build:backend` - Compila o backend
- `npm run build:frontend` - Compila o frontend
- `npm run build:both` - Compila ambas as aplicações

### Testes (Jest)

- `npm run test:backend` - Executa testes do backend
- `npm run test:frontend` - Executa testes do frontend
- `npm run test:both` - Executa testes de ambas as aplicações

## Backend (NestJS)

O backend está configurado com:
- NestJS framework
- Jest para testes unitários e e2e
- TypeScript
- ESLint e Prettier

**Porta padrão:** 3000

## Frontend (Angular)

O frontend está configurado com:
- Angular (versão 20+)
- Jest para testes (ao invés de Jasmine/Karma)
- TypeScript
- Routing habilitado
- CSS para estilos

**Porta padrão:** 4200

## Testes

Ambas as aplicações utilizam Jest como framework de testes.

### Backend
```bash
cd backend
npm test              # Executar testes
npm run test:watch    # Executar testes em modo watch
npm run test:cov      # Executar testes com cobertura
```

### Frontend
```bash
cd frontend
npm test              # Executar testes
npm run test:watch    # Executar testes em modo watch
npm run test:coverage # Executar testes com cobertura
```
