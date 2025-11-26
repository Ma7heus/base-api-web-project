# ================================================
# DOCKERFILE - FRONTEND (Angular)
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

# Build da aplicação para produção
RUN npm run build -- --configuration production

# Stage 2: Production com Nginx
FROM nginx:alpine AS production

# Criar diretórios temporários para nginx não-root
RUN mkdir -p /tmp/nginx/client_temp \
    /tmp/nginx/proxy_temp \
    /tmp/nginx/fastcgi_temp \
    /tmp/nginx/uwsgi_temp \
    /tmp/nginx/scgi_temp && \
    chown -R nginx:nginx /tmp/nginx && \
    chmod -R 755 /tmp/nginx

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar build do stage anterior
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Ajustar permissões dos arquivos estáticos
RUN chown -R nginx:nginx /usr/share/nginx/html

# Trocar para usuário não-root
USER nginx

# Expor porta (será ignorada pelo Coolify)
EXPOSE 8080

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
