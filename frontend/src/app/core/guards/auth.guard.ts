import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de autenticação
 *
 * Protege rotas que requerem autenticação.
 * Verifica se o usuário está autenticado antes de permitir acesso à rota.
 *
 * Uso nas rotas:
 * ```typescript
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]
 * }
 * ```
 *
 * Comportamento:
 * - Se autenticado: permite acesso
 * - Se não autenticado: redireciona para /login
 *
 * Este guard utiliza a nova API funcional de guards do Angular 19+
 * que substitui a interface CanActivate baseada em classes.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isUserAuthenticated()) {
    return true;
  }

  // Salva a URL tentada para redirecionar após login
  const returnUrl = state.url;
  console.warn(`Acesso negado a ${returnUrl}. Redirecionando para login...`);

  // Redireciona para login passando a URL de retorno
  router.navigate(['/login'], {
    queryParams: { returnUrl },
  });

  return false;
};
