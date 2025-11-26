/**
 * Configuração de ambiente para desenvolvimento
 * Este arquivo é usado quando a aplicação roda em modo de desenvolvimento
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiTimeout: 30000, // 30 segundos
  tokenKey: 'auth_token', // Chave para armazenar o token no localStorage
  userKey: 'user_data', // Chave para armazenar dados do usuário no localStorage
};
