# Deploy com GitHub Actions e Coolify

Este documento descreve como fazer o deploy da aplicação usando GitHub Actions para build e Coolify para gerenciamento.

## Arquitetura

- **Backend**: NestJS (Node.js 20 Alpine)
- **Frontend**: Angular + Nginx
- **Database**: PostgreSQL 15
- **Registry**: GitHub Container Registry (ghcr.io)
- **Deploy**: Coolify (gerencia proxy reverso e rotas)

## 1. Configuração do GitHub

### 1.1. Permitir GitHub Packages

As imagens são publicadas automaticamente no GitHub Container Registry quando você faz push para `main` ou cria tags.

1. Vá em **Settings** do repositório
2. Em **Actions** > **General** > **Workflow permissions**
3. Marque **Read and write permissions**

### 1.2. Tornar Imagens Públicas (Opcional)

Se quiser que as imagens sejam públicas:

1. Vá em seu perfil > **Packages**
2. Selecione o package (`base-api-web-project-backend` e `base-api-web-project-frontend`)
3. **Package settings** > **Change visibility** > **Public**

## 2. Build Automático

### Como Funciona

O workflow `.github/workflows/docker-build.yml` é acionado quando:

- Push na branch `main`
- Tags com formato `v*` (ex: `v1.0.0`)

### Tags Geradas

Para cada build, são criadas as seguintes tags:

```
ghcr.io/SEU-USUARIO/base-api-web-project-backend:latest
ghcr.io/SEU-USUARIO/base-api-web-project-backend:main
ghcr.io/SEU-USUARIO/base-api-web-project-backend:sha-abc123
```

Para releases com tag:

```
ghcr.io/SEU-USUARIO/base-api-web-project-backend:v1.0.0
ghcr.io/SEU-USUARIO/base-api-web-project-backend:1.0
```

## 3. Deploy no Coolify

### 3.1. Criar Arquivo .env

No Coolify, configure as seguintes variáveis de ambiente:

```bash
# GitHub (substitua pelo seu username)
GITHUB_USERNAME=seu-usuario-github

# Database
DB_DATABASE=app_production
DB_USERNAME=postgres
DB_PASSWORD=sua-senha-super-segura

# JWT
JWT_SECRET=gere-uma-chave-secreta-aqui-use-openssl-rand-base64-32
JWT_EXPIRES_IN=1d
```

### 3.2. Gerar JWT Secret Seguro

```bash
openssl rand -base64 32
```

### 3.3. Configurar no Coolify

1. Crie um novo projeto no Coolify
2. Selecione **Docker Compose**
3. Cole o conteúdo de `docker-compose-prod.yml`
4. Adicione as variáveis de ambiente acima
5. **Importante**: Configure o domínio e rotas:
   - Frontend: `app.seudominio.com` → `frontend:80`
   - Backend: `api.seudominio.com` → `backend:3000`

### 3.4. Deploy

```bash
# No Coolify, clique em Deploy
# Ou via git push, se configurou CI/CD
```

## 4. Verificação

### 4.1. Checar Logs

```bash
# Backend
docker logs app_backend_prod -f

# Frontend
docker logs app_frontend_prod -f

# Database
docker logs app_postgres_prod -f
```

### 4.2. Testar Endpoints

```bash
# Health check do backend
curl https://api.seudominio.com/health

# Frontend
curl https://app.seudominio.com
```

## 5. Migrations

Para rodar migrations em produção:

```bash
# Conectar no container do backend
docker exec -it app_backend_prod sh

# Rodar migrations
npm run migration:up
```

Ou adicione ao `docker-compose-prod.yml` um comando de inicialização:

```yaml
backend:
  # ...
  command: sh -c "npm run migration:up && node dist/src/main.js"
```

## 6. Atualizações

### 6.1. Atualizar Código

```bash
# Faça commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Aguarde o GitHub Action completar o build
# No Coolify, faça re-deploy ou configure auto-deploy
```

### 6.2. Criar Release

```bash
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

## 7. Troubleshooting

### Imagem não encontrada

Verifique se:
1. O username no `.env` está correto
2. As imagens estão públicas (ou o Coolify tem acesso ao registry privado)
3. O build no GitHub Actions foi concluído com sucesso

### Backend não inicia

Verifique:
1. Variáveis de ambiente estão configuradas
2. PostgreSQL está saudável: `docker ps`
3. Logs do backend: `docker logs app_backend_prod`

### Migrations não rodam

```bash
# Entre no container
docker exec -it app_backend_prod sh

# Verifique as migrations
ls -la database/migrations/

# Rode manualmente
npm run migration:up
```

## 8. Segurança

### Checklist

- [ ] JWT_SECRET é único e seguro (32+ caracteres)
- [ ] DB_PASSWORD é forte
- [ ] Imagens usam usuários não-root
- [ ] Variáveis sensíveis não estão commitadas
- [ ] HTTPS está habilitado no Coolify
- [ ] Rate limiting está ativo no backend

## 9. Monitoramento

### Recursos do Container

```bash
# Ver uso de recursos
docker stats app_backend_prod app_frontend_prod app_postgres_prod
```

### Logs Centralizados

Configure no Coolify para enviar logs para:
- Grafana Loki
- CloudWatch
- Datadog
- Outros serviços de logging

## Suporte

Em caso de problemas:

1. Verifique os logs: `docker logs <container_name>`
2. Teste conexão com DB: `docker exec -it app_postgres_prod psql -U postgres`
3. Verifique networks: `docker network inspect base-api-web-project_app_network`
