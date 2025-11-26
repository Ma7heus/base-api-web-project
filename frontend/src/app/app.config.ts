import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

/**
 * Configuração global da aplicação Angular
 *
 * Providers registrados:
 * - provideHttpClient: Habilita HttpClient para requisições HTTP
 * - withInterceptors: Registra interceptors funcionais (Angular 19+)
 *   - authInterceptor: Adiciona token JWT automaticamente nas requisições
 *   - errorInterceptor: Trata erros HTTP de forma centralizada
 * - provideRouter: Configura sistema de rotas
 * - provideZoneChangeDetection: Otimiza detecção de mudanças
 *
 * IMPORTANTE:
 * - A ordem dos interceptors importa!
 * - authInterceptor deve vir ANTES do errorInterceptor
 * - authInterceptor adiciona o token
 * - errorInterceptor trata os erros da resposta
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(), // Necessário para PrimeNG
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-theme',
          cssLayer: false
        }
      }
    }),
    // HttpClient com interceptors
    provideHttpClient(
      withInterceptors([
        authInterceptor,   // Adiciona token JWT
        errorInterceptor,  // Trata erros HTTP
      ])
    ),
  ]
};
