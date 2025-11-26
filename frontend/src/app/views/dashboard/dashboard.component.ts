import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

/**
 * Componente Dashboard
 *
 * Página principal da aplicação após login.
 * Acessível para todos os usuários autenticados (USER e ADMIN).
 *
 * Features:
 * - Exibe informações do usuário logado
 * - Cards com estatísticas (exemplo)
 * - Área de boas-vindas personalizada
 *
 * Proteção:
 * - Rota protegida por authGuard
 * - Requer autenticação
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  protected readonly authService = inject(AuthService);

  // Dados de exemplo para cards
  protected readonly stats = [
    {
      title: 'Total de Usuários',
      value: '1,234',
      icon: '👥',
      color: '#667eea'
    },
    {
      title: 'Atividades',
      value: '56',
      icon: '📊',
      color: '#764ba2'
    },
    {
      title: 'Notificações',
      value: '12',
      icon: '🔔',
      color: '#f093fb'
    },
    {
      title: 'Performance',
      value: '94%',
      icon: '⚡',
      color: '#4facfe'
    }
  ];
}
