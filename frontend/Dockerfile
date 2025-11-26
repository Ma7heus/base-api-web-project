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

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar build do stage anterior
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Usuário não-root para segurança
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# Expor porta (será ignorada pelo Coolify)
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
