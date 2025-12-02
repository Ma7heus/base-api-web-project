# ================================================
# DOCKERFILE - FRONTEND (Angular)
# ================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./
RUN npm ci

# Instalar dependências
COPY . .
RUN npm run build -- --configuration production

# ----------- ETAPA 2: Imagem final com Nginx (imagem nginx:alpine) -----------
FROM nginx:alpine

# 2.1) Instala o curl (para o healthcheck do Coolify)
RUN apk add --no-cache curl

# 2.2) Remove a configuração padrão que exibe o “Welcome to nginx!”
RUN rm /etc/nginx/conf.d/default.conf || true

# 2.3) Copia nosso default.conf customizado para /etc/nginx/conf.d/
COPY default.conf /etc/nginx/conf.d/default.conf

# 2.4) Copia toda a build do Angular para o diretório padrão de arquivos estáticos
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# 2.5) Informa que o container “ouve” a porta 80
EXPOSE 80

# 2.6) Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
