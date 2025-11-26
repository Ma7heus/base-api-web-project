import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../models';

/**
 * Interceptor de tratamento de erros HTTP
 *
 * Intercepta todas as respostas HTTP e trata erros de forma centralizada.
 *
 * Funcionalidades:
 * - Trata erros 401 (Unauthorized) fazendo logout automático
 * - Trata erros 403 (Forbidden) com mensagem apropriada
 * - Trata erros 429 (Too Many Requests) de rate limiting
 * - Formata mensagens de erro para exibição ao usuário
 * - Mantém compatibilidade com a estrutura de erro do backend
 *
 * Boas práticas:
 * - Logout automático quando token inválido/expirado
 * - Mensagens de erro amigáveis ao usuário
 * - Preserva a estrutura de erro original para debugging
 * - Não exibe detalhes técnicos em produção
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro inesperado';

      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente
        console.error('Erro do cliente:', error.error.message);
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        // Erro do lado do servidor
        console.error(`Erro HTTP ${error.status}:`, error.error);

        // Trata erros específicos
        switch (error.status) {
          case 401:
            // Não autorizado - token inválido ou expirado
            console.warn('Token inválido ou expirado. Fazendo logout...');
            authService.logout();
            errorMessage = 'Sessão expirada. Faça login novamente.';
            break;

          case 403:
            // Proibido - sem permissão
            errorMessage = 'Você não tem permissão para acessar este recurso.';
            // Opcionalmente redirecionar para página de erro ou dashboard
            router.navigate(['/dashboard']);
            break;

          case 404:
            // Não encontrado
            errorMessage = 'Recurso não encontrado.';
            break;

          case 409:
            // Conflito - geralmente duplicação de dados
            errorMessage = extractErrorMessage(error.error);
            break;

          case 429:
            // Too Many Requests - rate limiting
            errorMessage = 'Muitas tentativas. Aguarde um momento e tente novamente.';
            break;

          case 500:
            // Erro interno do servidor
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;

          case 0:
            // Erro de rede ou servidor não acessível
            errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
            break;

          default:
            // Outros erros
            errorMessage = extractErrorMessage(error.error);
            break;
        }
      }

      // Cria um erro padronizado para propagar
      const apiError: ApiError = {
        statusCode: error.status,
        message: errorMessage,
        error: error.statusText || 'Error',
        timestamp: new Date().toISOString(),
        path: req.url,
      };

      return throwError(() => apiError);
    })
  );
};

/**
 * Extrai a mensagem de erro da resposta da API
 *
 * @param errorResponse - Resposta de erro da API
 * @returns Mensagem de erro formatada
 */
function extractErrorMessage(errorResponse: any): string {
  if (!errorResponse) {
    return 'Ocorreu um erro inesperado';
  }

  // Se a mensagem é um array (múltiplos erros de validação)
  if (Array.isArray(errorResponse.message)) {
    return errorResponse.message.join(', ');
  }

  // Se a mensagem é uma string
  if (typeof errorResponse.message === 'string') {
    return errorResponse.message;
  }

  // Fallback
  return errorResponse.error || 'Ocorreu um erro inesperado';
}
