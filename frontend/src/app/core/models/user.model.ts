/**
 * Enum de roles de usuário
 * Deve estar sincronizado com o backend (UserRole)
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

/**
 * Interface do modelo de usuário
 * Representa os dados de um usuário autenticado
 */
export interface User {
  id: number;
  name: string;
  email: string;
  login?: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * DTO para requisição de login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * DTO para resposta de login
 * Retornado pelo backend após autenticação bem-sucedida
 */
export interface LoginResponse {
  access_token: string;
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * DTO para criação de usuário
 */
export interface CreateUserRequest {
  name: string;
  login: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * DTO para atualização de usuário
 */
export interface UpdateUserRequest {
  name?: string;
  login?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

/**
 * Interface para erro da API
 * Estrutura padronizada de erro retornada pelo backend
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
  path?: string;
}
