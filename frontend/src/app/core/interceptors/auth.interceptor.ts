import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor de autenticação HTTP
 *
 * Intercepta todas as requisições HTTP e adiciona automaticamente
 * o token JWT no header Authorization quando o usuário está autenticado.
 *
 * Formato do header: Authorization: Bearer <token>
 *
 * Este interceptor utiliza a nova API funcional de interceptors do Angular 19+
 * que substitui a interface HttpInterceptor baseada em classes.
 *
 * Boas práticas:
 * - Adiciona token apenas se existir
 * - Usa o padrão Bearer token
 * - Não modifica requisições que já possuem Authorization header
 * - Clona a requisição para não modificar a original
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Se não há token ou a requisição já tem Authorization, segue sem modificar
  if (!token || req.headers.has('Authorization')) {
    return next(req);
  }

  // Clona a requisição adicionando o header Authorization
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });

  return next(authReq);
};
