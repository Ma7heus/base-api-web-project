import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

/**
 * Guard de controle de acesso baseado em roles
 *
 * Protege rotas que requerem roles específicas.
 * Verifica se o usuário autenticado possui a role necessária.
 *
 * Uso nas rotas:
 * ```typescript
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: [UserRole.ADMIN] }
 * }
 * ```
 *
 * Comportamento:
 * - Se tem a role: permite acesso
 * - Se autenticado mas sem role: redireciona para /dashboard com mensagem
 * - Se não autenticado: redireciona para /login
 *
 * IMPORTANTE:
 * - Use sempre em conjunto com authGuard
 * - authGuard deve vir ANTES do roleGuard na lista de guards
 * - Defina as roles permitidas em route.data.roles
 *
 * Este guard utiliza a nova API funcional de guards do Angular 19+
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se está autenticado
  if (!authService.isUserAuthenticated()) {
    console.warn('Usuário não autenticado. Redirecionando para login...');
    router.navigate(['/login']);
    return false;
  }

  // Obtém as roles permitidas da configuração da rota
  const allowedRoles = route.data['roles'] as UserRole[];

  // Se não há roles definidas, permite acesso
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Verifica se o usuário tem alguma das roles permitidas
  if (authService.hasAnyRole(allowedRoles)) {
    return true;
  }

  // Usuário autenticado mas sem permissão
  const currentUser = authService.currentUser();
  console.warn(
    `Acesso negado. Usuário ${currentUser?.email} (role: ${currentUser?.role}) ` +
    `tentou acessar rota que requer: ${allowedRoles.join(', ')}`
  );

  // Redireciona para dashboard
  router.navigate(['/dashboard']);

  // Opcionalmente, você pode exibir uma mensagem ao usuário
  // usando um serviço de notificações (toast, snackbar, etc)
  alert('Você não tem permissão para acessar esta página.');

  return false;
};
