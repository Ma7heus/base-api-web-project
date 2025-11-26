# ================================================
# DOCKERFILE - BACKEND (NestJS)
# ================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar apenas dependências de produção (novo formato)
RUN npm ci --omit=dev && npm cache clean --force

# Copiar build do stage anterior
COPY --from=builder /app/dist ./dist

# Copiar pasta database (migrations, schema)
COPY --from=builder /app/database ./database

# Copiar tsconfig para resolução de paths (se necessário)
COPY --from=builder /app/tsconfig*.json ./

# Usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

# Expor porta (será ignorada pelo Coolify)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/src/main.js"]
