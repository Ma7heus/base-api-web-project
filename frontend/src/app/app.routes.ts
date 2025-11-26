import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models';

/**
 * Configuração de rotas da aplicação
 *
 * Estrutura:
 * - / -> Redireciona para /dashboard
 * - /login -> Página de login (pública)
 * - /dashboard -> Dashboard (protegida, requer autenticação)
 * - /admin -> Painel admin (protegida, requer role ADMIN)
 *
 * Guards aplicados:
 * - authGuard: Protege rotas que requerem autenticação
 * - roleGuard: Protege rotas que requerem roles específicas
 *
 * IMPORTANTE:
 * - authGuard deve vir ANTES de roleGuard na lista de guards
 * - Rotas protegidas usam LayoutComponent para estrutura comum
 * - Login não usa layout (página isolada)
 */
export const routes: Routes = [
  // Rota raiz - redireciona para dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // Rota de login (pública)
  {
    path: 'login',
    loadComponent: () =>
      import('./views/login/login.component').then((m) => m.LoginComponent),
  },

  // Rotas protegidas com layout
  {
    path: '',
    loadComponent: () =>
      import('./core/components/layout/layout.component').then(
        (m) => m.LayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      // Dashboard - requer autenticação
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./views/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },

      // Admin - requer autenticação E role ADMIN
      {
        path: 'admin',
        loadComponent: () =>
          import('./views/admin/admin.component').then(
            (m) => m.AdminComponent
          ),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
      },
    ],
  },

  // Rota 404 - página não encontrada
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
