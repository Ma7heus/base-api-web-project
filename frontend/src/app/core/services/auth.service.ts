import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  UserRole,
  LoginRequest,
  LoginResponse,
} from '../models';

/**
 * Serviço de autenticação
 *
 * Gerencia todo o fluxo de autenticação da aplicação:
 * - Login e logout
 * - Armazenamento e recuperação do token JWT
 * - Persistência dos dados do usuário
 * - Estado de autenticação reativo com signals
 *
 * Boas práticas implementadas:
 * - Signals para reatividade moderna do Angular
 * - Persistência no localStorage para manter sessão após refresh
 * - Limpeza completa de dados no logout
 * - Verificação de expiração do token
 * - Type-safety completo
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Signals para estado reativo
  private readonly currentUserSignal = signal<User | null>(null);
  private readonly isAuthenticatedSignal = signal<boolean>(false);

  // Computed signals derivados
  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  public readonly isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);
  public readonly isUser = computed(() => this.currentUser()?.role === UserRole.USER);

  // BehaviorSubject para compatibilidade com Observable (se necessário)
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Restaura sessão ao inicializar o serviço
    this.restoreSession();
  }

  /**
   * Realiza login do usuário
   *
   * @param credentials - Email e senha do usuário
   * @returns Observable com a resposta do login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          // Salva token e dados do usuário
          this.setSession(response);
        }),
        catchError((error) => {
          console.error('Erro no login:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Realiza logout do usuário
   * Remove todas as informações armazenadas e redireciona para login
   */
  logout(): void {
    // Remove dados do localStorage
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.userKey);

    // Limpa estado
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.currentUserSubject.next(null);

    // Redireciona para login
    this.router.navigate(['/login']);
  }

  /**
   * Obtém o token JWT armazenado
   *
   * @returns Token JWT ou null se não existir
   */
  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  /**
   * Verifica se o usuário está autenticado
   *
   * @returns true se autenticado, false caso contrário
   */
  isUserAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Verifica se o token está expirado
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Verifica se o usuário tem uma role específica
   *
   * @param role - Role a ser verificada
   * @returns true se o usuário tem a role, false caso contrário
   */
  hasRole(role: UserRole): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }

  /**
   * Verifica se o usuário tem pelo menos uma das roles especificadas
   *
   * @param roles - Array de roles a serem verificadas
   * @returns true se o usuário tem alguma das roles, false caso contrário
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Obtém os dados do usuário autenticado do backend
   *
   * @returns Observable com os dados do usuário
   */
  getCurrentUserFromApi(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
        this.currentUserSubject.next(user);
        this.saveUserData(user);
      })
    );
  }

  /**
   * Atualiza os dados do usuário no estado
   *
   * @param user - Dados do usuário a serem atualizados
   */
  updateUser(user: User): void {
    this.currentUserSignal.set(user);
    this.currentUserSubject.next(user);
    this.saveUserData(user);
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Salva a sessão do usuário após login bem-sucedido
   *
   * @param response - Resposta do backend com token e dados do usuário
   */
  private setSession(response: LoginResponse): void {
    // Salva token
    localStorage.setItem(environment.tokenKey, response.access_token);

    // Extrai dados do usuário da resposta
    const user: User = {
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role,
    };

    // Salva dados do usuário
    this.saveUserData(user);

    // Atualiza estado
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(true);
    this.currentUserSubject.next(user);
  }

  /**
   * Salva dados do usuário no localStorage
   *
   * @param user - Dados do usuário a serem salvos
   */
  private saveUserData(user: User): void {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
  }

  /**
   * Restaura a sessão do usuário a partir do localStorage
   * Chamado na inicialização do serviço
   */
  private restoreSession(): void {
    const token = this.getToken();
    const userData = localStorage.getItem(environment.userKey);

    if (token && userData && !this.isTokenExpired(token)) {
      try {
        const user: User = JSON.parse(userData);
        this.currentUserSignal.set(user);
        this.isAuthenticatedSignal.set(true);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        this.logout();
      }
    } else if (token && this.isTokenExpired(token)) {
      // Token expirado, faz logout
      this.logout();
    }
  }

  /**
   * Verifica se o token JWT está expirado
   *
   * @param token - Token JWT a ser verificado
   * @returns true se expirado, false caso contrário
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload.exp) {
        return false; // Se não tem exp, considera válido
      }

      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate < new Date();
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return true; // Se não conseguir decodificar, considera expirado
    }
  }

  /**
   * Decodifica o token JWT para extrair o payload
   *
   * @param token - Token JWT a ser decodificado
   * @returns Payload do token
   */
  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido');
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Erro ao decodificar token JWT');
    }
  }
}
