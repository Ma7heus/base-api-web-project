import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ThemeConfigComponent } from '../../core/components/theme-config/theme-config.component';
import { LoginRequest } from '../../core/models';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';

/**
 * Componente de Login
 *
 * Responsável pela interface e lógica de autenticação do usuário.
 *
 * Features:
 * - Formulário reativo com validações
 * - Exibição de erros de validação
 * - Feedback visual durante loading
 * - Mensagens de erro do backend
 * - Redirecionamento após login bem-sucedido
 * - Suporta returnUrl para voltar à página tentada antes do login
 *
 * Validações implementadas:
 * - Email: obrigatório e formato válido
 * - Senha: obrigatória e mínimo 8 caracteres
 *
 * Boas práticas:
 * - Standalone component (Angular 19+)
 * - Signals para estado reativo
 * - Reactive Forms para validação
 * - Tratamento de erros centralizado
 * - UX com loading states e mensagens claras
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    MessageModule,
    CheckboxModule,
    ThemeConfigComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Estado reativo com signals
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  // Formulário de login
  protected readonly loginForm: FormGroup;

  constructor() {
    // Inicializa o formulário com validações
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    // Se já estiver autenticado, redireciona para dashboard
    if (this.authService.isUserAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Submete o formulário de login
   */
  onSubmit(): void {
    // Limpa mensagem de erro anterior
    this.errorMessage.set(null);

    // Valida o formulário
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Inicia loading
    this.isLoading.set(true);

    // Prepara credenciais
    const credentials: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    // Realiza login
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido:', response);

        // Obtém a URL de retorno (se houver)
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

        // Redireciona
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        console.error('Erro no login:', error);
        this.isLoading.set(false);

        // Exibe mensagem de erro
        if (error.statusCode === 401) {
          this.errorMessage.set('Email ou senha inválidos.');
        } else if (error.statusCode === 429) {
          this.errorMessage.set('Muitas tentativas de login. Aguarde um momento.');
        } else {
          this.errorMessage.set(error.message || 'Erro ao fazer login. Tente novamente.');
        }
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Alterna visibilidade da senha
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Verifica se um campo tem erro
   */
  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtém mensagem de erro de um campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return `${fieldName === 'email' ? 'Email' : 'Senha'} é obrigatório(a)`;
    }

    if (field.errors['email']) {
      return 'Email inválido';
    }

    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Senha deve ter no mínimo ${minLength} caracteres`;
    }

    return 'Campo inválido';
  }
}
