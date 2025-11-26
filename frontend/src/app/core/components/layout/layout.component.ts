import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ThemeConfigComponent } from '../theme-config/theme-config.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

/**
 * Componente de Layout
 *
 * Layout principal da aplicação para páginas autenticadas.
 * Inclui header com navegação e informações do usuário.
 *
 * Features:
 * - Header com menu de navegação
 * - Exibição de informações do usuário logado
 * - Botão de logout
 * - Menu responsivo
 * - Navegação condicional baseada em role
 * - Outlet para conteúdo das páginas
 *
 * Uso:
 * - Envolve todas as rotas protegidas
 * - Exibe automaticamente dados do usuário autenticado
 * - Menu Admin visível apenas para usuários com role ADMIN
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ThemeConfigComponent,
    ButtonModule,
    TooltipModule,
    AvatarModule,
    MenubarModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  @ViewChild(ThemeConfigComponent) themeConfig!: ThemeConfigComponent;

  protected menuItems: MenuItem[] = [];

  constructor() {
    this.updateMenuItems();
  }

  /**
   * Atualiza os itens do menu baseado no role do usuário
   */
  private updateMenuItems(): void {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/dashboard',
      },
    ];

    // Adiciona item Admin apenas se o usuário for ADMIN
    if (this.authService.isAdmin()) {
      this.menuItems.push({
        label: 'Admin',
        icon: 'pi pi-shield',
        routerLink: '/admin',
      });
    }
  }

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Navega para uma rota
   */
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
