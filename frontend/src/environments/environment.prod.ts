/**
 * Configuração de ambiente para produção
 * Este arquivo é usado quando a aplicação é compilada para produção
 *
 * IMPORTANTE: Altere a apiUrl para o endereço do seu backend em produção
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.seudominio.com/api', // ALTERE PARA SEU DOMÍNIO
  apiTimeout: 30000, // 30 segundos
  tokenKey: 'auth_token',
  userKey: 'user_data',
};
