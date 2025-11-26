import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { User } from '../../core/models';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

/**
 * Componente Admin
 *
 * Página de administração acessível apenas para usuários com role ADMIN.
 * Exibe lista de usuários e permite gerenciamento.
 *
 * Features:
 * - Listagem de usuários do sistema
 * - Indicador de role de cada usuário
 * - Loading states
 * - Tratamento de erros
 *
 * Proteção:
 * - Rota protegida por authGuard + roleGuard
 * - Requer role ADMIN
 *
 * Exemplo de integração com API:
 * - GET /api/user - Lista todos os usuários (requer role ADMIN)
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    MessageModule,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly authService = inject(AuthService);

  // Estado reativo
  protected readonly users = signal<User[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  // Computed signals para estatísticas
  protected readonly totalAdmins = computed(() =>
    this.users().filter(u => u.role === 'ADMIN').length
  );
  protected readonly totalUsers = computed(() =>
    this.users().filter(u => u.role === 'USER').length
  );

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Carrega lista de usuários da API
   */
  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.get<User[]>(`${environment.apiUrl}/user`).subscribe({
      next: (users) => {
        console.log('Usuários carregados:', users);
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.errorMessage.set(
          error.message || 'Erro ao carregar usuários. Tente novamente.'
        );
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Retorna a classe CSS baseada na role do usuário
   */
  getRoleBadgeClass(role: string): string {
    return role === 'ADMIN' ? 'badge-admin' : 'badge-user';
  }
}
