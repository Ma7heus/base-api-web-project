# Frontend - Angular Application

Aplicação frontend construída com Angular 20, TypeScript e Signals, integrada com a API backend NestJS.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Execução](#instalação-e-execução)
- [Arquitetura de Autenticação](#arquitetura-de-autenticação)
- [Sistema de Rotas](#sistema-de-rotas)
- [Guards e Interceptors](#guards-e-interceptors)
- [Componentes](#componentes)
- [Boas Práticas](#boas-práticas)
- [Testes](#testes)

## 🎯 Visão Geral

Frontend moderno e seguro que se conecta com o backend NestJS, implementando:

- ✅ Autenticação JWT completa
- ✅ Controle de acesso baseado em roles (RBAC)
- ✅ Guards para proteção de rotas
- ✅ Interceptors HTTP para token e erro
- ✅ Signals para reatividade (Angular 19+)
- ✅ Standalone Components
- ✅ Lazy Loading de componentes
- ✅ TypeScript estrito
- ✅ Responsive Design

## 🚀 Tecnologias

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Angular | 20.3.0 | Framework frontend |
| TypeScript | 5.9.2 | Linguagem de programação |
| RxJS | 7.8.0 | Programação reativa |
| Jest | 30.2.0 | Framework de testes |
| Signals | Built-in | Estado reativo moderno |

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                      # Arquitetura central
│   │   │   ├── models/                # Interfaces e tipos TypeScript
│   │   │   │   ├── user.model.ts      # User, UserRole, Login/Response DTOs
│   │   │   │   └── index.ts
│   │   │   ├── services/              # Serviços globais
│   │   │   │   ├── auth.service.ts    # Serviço de autenticação
│   │   │   │   └── index.ts
│   │   │   ├── guards/                # Guards de rota
│   │   │   │   ├── auth.guard.ts      # Proteção de autenticação
│   │   │   │   ├── role.guard.ts      # Proteção por role
│   │   │   │   └── index.ts
│   │   │   ├── interceptors/          # HTTP Interceptors
│   │   │   │   ├── auth.interceptor.ts    # Adiciona token JWT
│   │   │   │   ├── error.interceptor.ts   # Tratamento de erros
│   │   │   │   └── index.ts
│   │   │   └── components/            # Componentes compartilhados
│   │   │       └── layout/            # Layout principal
│   │   │           ├── layout.component.ts
│   │   │           ├── layout.component.html
│   │   │           └── layout.component.css
│   │   ├── views/                     # Páginas da aplicação
│   │   │   ├── login/                 # Página de login
│   │   │   ├── dashboard/             # Dashboard (USER + ADMIN)
│   │   │   └── admin/                 # Painel admin (ADMIN only)
│   │   ├── app.ts                     # Componente raiz
│   │   ├── app.routes.ts              # Configuração de rotas
│   │   └── app.config.ts              # Configuração global
│   ├── environments/                   # Configurações de ambiente
│   │   ├── environment.ts             # Desenvolvimento
│   │   └── environment.prod.ts        # Produção
│   ├── index.html
│   ├── main.ts
│   └── styles.css                     # Estilos globais
├── angular.json                       # Configuração do Angular CLI
├── tsconfig.json                      # Configuração do TypeScript
└── package.json
```

## ⚙️ Instalação e Execução

### Pré-requisitos

- Node.js 18+ e npm
- Backend rodando em `http://localhost:3000`

### Instalação

```bash
# Instalar dependências
npm install
```

### Configuração

Edite o arquivo de ambiente para apontar para seu backend:

**src/environments/environment.ts** (desenvolvimento):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',  // URL do backend
  apiTimeout: 30000,
  tokenKey: 'auth_token',
  userKey: 'user_data',
};
```

**src/environments/environment.prod.ts** (produção):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.seudominio.com/api',  // ALTERE AQUI
  apiTimeout: 30000,
  tokenKey: 'auth_token',
  userKey: 'user_data',
};
```

### Executar

```bash
# Desenvolvimento (http://localhost:4200)
npm start
# ou
ng serve

# Build de produção
npm run build

# Testes
npm test

# Testes com coverage
npm run test:cov
```

## 🔐 Arquitetura de Autenticação

### Fluxo de Autenticação

```
1. Usuário acessa /login
2. Insere email e senha
3. Frontend envia POST /api/auth/login
4. Backend valida credenciais
5. Backend retorna:
   {
     "access_token": "eyJhbG...",
     "id": 1,
     "name": "User",
     "email": "user@example.com",
     "role": "ADMIN"
   }
6. Frontend armazena token e dados no localStorage
7. AuthService atualiza estado com signals
8. Redireciona para /dashboard
```

### AuthService

**Localização:** `src/app/core/services/auth.service.ts`

**Responsabilidades:**
- Login e logout
- Gerenciamento de token JWT
- Persistência no localStorage
- Estado reativo com signals
- Verificação de expiração de token

**API Pública:**

```typescript
// Signals (somente leitura)
authService.currentUser()           // User | null
authService.isAuthenticated()       // boolean
authService.isAdmin()               // boolean (computed)
authService.isUser()                // boolean (computed)

// Observables (compatibilidade)
authService.currentUser$            // Observable<User | null>

// Métodos
authService.login(credentials)      // Observable<LoginResponse>
authService.logout()                // void
authService.getToken()              // string | null
authService.isUserAuthenticated()   // boolean
authService.hasRole(role)           // boolean
authService.hasAnyRole(roles)       // boolean
```

**Exemplo de uso:**

```typescript
export class MyComponent {
  protected readonly authService = inject(AuthService);

  doSomething() {
    const user = this.authService.currentUser();

    if (this.authService.isAdmin()) {
      // Lógica para admin
    }
  }
}
```

### Persistência de Sessão

O AuthService automaticamente:
- ✅ Salva token e dados do usuário no localStorage ao fazer login
- ✅ Restaura sessão ao recarregar a página (se token válido)
- ✅ Faz logout automático se token expirado
- ✅ Limpa dados ao fazer logout manual

**Chaves no localStorage:**
- `auth_token`: Token JWT
- `user_data`: Dados do usuário (JSON)

## 🛣️ Sistema de Rotas

**Localização:** `src/app/app.routes.ts`

### Rotas Disponíveis

| Rota | Componente | Proteção | Descrição |
|------|-----------|----------|-----------|
| `/` | - | - | Redireciona para `/dashboard` |
| `/login` | LoginComponent | Pública | Página de login |
| `/dashboard` | DashboardComponent | authGuard | Dashboard principal |
| `/admin` | AdminComponent | authGuard + roleGuard | Painel de administração |
| `/**` | - | - | Redireciona para `/dashboard` |

### Estrutura de Rotas

```typescript
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Rota pública
  { path: 'login', loadComponent: () => import('./views/login/...') },

  // Rotas protegidas com layout
  {
    path: '',
    loadComponent: () => import('./core/components/layout/...'),
    canActivate: [authGuard],  // Requer autenticação
    children: [
      { path: 'dashboard', loadComponent: () => import('./views/dashboard/...') },
      {
        path: 'admin',
        loadComponent: () => import('./views/admin/...'),
        canActivate: [roleGuard],  // Requer role ADMIN
        data: { roles: [UserRole.ADMIN] }
      },
    ],
  },
];
```

### Lazy Loading

Todos os componentes são carregados sob demanda (lazy loading) usando `loadComponent()`, reduzindo o bundle inicial.

## 🛡️ Guards e Interceptors

### Guards

#### AuthGuard

**Localização:** `src/app/core/guards/auth.guard.ts`

**Propósito:** Protege rotas que requerem autenticação.

**Comportamento:**
- ✅ Se autenticado → permite acesso
- ❌ Se não autenticado → redireciona para `/login`
- Salva URL tentada em `returnUrl` para redirecionar após login

**Uso:**
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]
}
```

#### RoleGuard

**Localização:** `src/app/core/guards/role.guard.ts`

**Propósito:** Protege rotas que requerem roles específicas.

**Comportamento:**
- ✅ Se tem a role → permite acesso
- ❌ Se autenticado mas sem role → redireciona para `/dashboard` com alerta
- ❌ Se não autenticado → redireciona para `/login`

**Uso:**
```typescript
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [authGuard, roleGuard],  // authGuard DEVE vir primeiro
  data: { roles: [UserRole.ADMIN] }
}
```

**IMPORTANTE:** Sempre use `authGuard` antes de `roleGuard`!

### Interceptors

#### AuthInterceptor

**Localização:** `src/app/core/interceptors/auth.interceptor.ts`

**Propósito:** Adiciona automaticamente o token JWT em todas as requisições HTTP.

**Comportamento:**
- Intercepta todas as requisições HTTP
- Se há token, adiciona header: `Authorization: Bearer <token>`
- Não modifica requisições que já possuem header Authorization

#### ErrorInterceptor

**Localização:** `src/app/core/interceptors/error.interceptor.ts`

**Propósito:** Trata erros HTTP de forma centralizada.

**Tratamento de erros:**

| Status | Ação |
|--------|------|
| 401 | Logout automático + redireciona para login |
| 403 | Mensagem de permissão negada + redireciona para dashboard |
| 404 | Mensagem "Recurso não encontrado" |
| 409 | Exibe mensagem de conflito (ex: email duplicado) |
| 429 | Mensagem de rate limit excedido |
| 500 | Mensagem de erro do servidor |
| 0 | Mensagem de erro de conexão |

**Resposta padronizada:**
```typescript
interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}
```

### Registro de Interceptors

**Localização:** `src/app/app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,    // Adiciona token (PRIMEIRO)
        errorInterceptor,   // Trata erros (DEPOIS)
      ])
    ),
  ]
};
```

**IMPORTANTE:** A ordem importa! AuthInterceptor deve vir antes do ErrorInterceptor.

## 🧩 Componentes

### LoginComponent

**Localização:** `src/app/views/login/login.component.ts`

**Features:**
- ✅ Formulário reativo com validações
- ✅ Validação de email (formato válido)
- ✅ Validação de senha (mínimo 8 caracteres)
- ✅ Toggle para mostrar/ocultar senha
- ✅ Loading state durante requisição
- ✅ Mensagens de erro claras
- ✅ Suporte a returnUrl (redireciona para URL tentada antes do login)

**Validações:**
```typescript
email: ['', [Validators.required, Validators.email]]
password: ['', [Validators.required, Validators.minLength(8)]]
```

### LayoutComponent

**Localização:** `src/app/core/components/layout/layout.component.ts`

**Features:**
- ✅ Header com navegação
- ✅ Exibição de informações do usuário logado
- ✅ Menu condicional (Admin visível apenas para role ADMIN)
- ✅ Botão de logout
- ✅ Footer
- ✅ Outlet para conteúdo das páginas
- ✅ Design responsivo

**Estrutura:**
```
┌────────────────────────────────────┐
│ Header (Logo, Nav, User, Logout)   │
├────────────────────────────────────┤
│                                    │
│  <router-outlet>                   │
│  (Dashboard ou Admin)              │
│                                    │
├────────────────────────────────────┤
│ Footer                             │
└────────────────────────────────────┘
```

### DashboardComponent

**Localização:** `src/app/views/dashboard/dashboard.component.ts`

**Acesso:** Todos os usuários autenticados (USER e ADMIN)

**Features:**
- ✅ Boas-vindas personalizadas
- ✅ Cards com estatísticas
- ✅ Exibição de dados do usuário
- ✅ Ações rápidas
- ✅ Lista de atividades recentes

### AdminComponent

**Localização:** `src/app/views/admin/admin.component.ts`

**Acesso:** Apenas usuários com role ADMIN

**Features:**
- ✅ Listagem de todos os usuários do sistema
- ✅ Cards com estatísticas de usuários
- ✅ Tabela responsiva
- ✅ Loading states
- ✅ Tratamento de erros
- ✅ Badges para roles
- ✅ Botões de ação (editar, deletar)

**API utilizada:**
```typescript
// GET /api/user (requer role ADMIN)
this.http.get<User[]>(`${environment.apiUrl}/user`)
```

## 📐 Boas Práticas

### 1. Standalone Components

Todos os componentes usam a arquitetura standalone (Angular 19+):

```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-component.html',
})
export class MyComponent {}
```

### 2. Signals para Estado Reativo

Use signals ao invés de BehaviorSubjects para estado simples:

```typescript
protected readonly isLoading = signal(false);
protected readonly users = signal<User[]>([]);

// Computed signals
protected readonly totalUsers = computed(() => this.users().length);

// No template
@if (isLoading()) {
  <div>Carregando...</div>
}
```

### 3. Inject Function

Use `inject()` ao invés de constructor injection:

```typescript
export class MyComponent {
  private readonly http = inject(HttpClient);
  protected readonly authService = inject(AuthService);

  // Sem constructor
}
```

### 4. Lazy Loading

Use `loadComponent()` para carregar componentes sob demanda:

```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./views/dashboard/dashboard.component')
    .then(m => m.DashboardComponent)
}
```

### 5. TypeScript Strict

O projeto usa TypeScript strict mode. Sempre:
- ✅ Defina tipos explícitos
- ✅ Use interfaces para dados da API
- ✅ Evite `any`
- ✅ Use `null` ou `undefined` de forma explícita

### 6. Segurança

**Nunca:**
- ❌ Armazene senhas no localStorage
- ❌ Exponha o token JWT em logs
- ❌ Ignore erros de autenticação
- ❌ Use `any` para dados sensíveis

**Sempre:**
- ✅ Valide inputs do usuário
- ✅ Trate erros da API
- ✅ Use guards para proteger rotas
- ✅ Verifique permissões no backend também (segurança em camadas)

### 7. Responsividade

Todos os componentes são responsivos:
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

Use media queries no CSS:
```css
@media (max-width: 768px) {
  /* Estilos mobile */
}
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Com coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Estrutura de Testes

```
src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── auth.service.spec.ts      # Testes do AuthService
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── auth.guard.spec.ts        # Testes do AuthGuard
│   └── interceptors/
│       ├── auth.interceptor.ts
│       └── auth.interceptor.spec.ts  # Testes do AuthInterceptor
└── views/
    └── login/
        ├── login.component.ts
        └── login.component.spec.ts   # Testes do LoginComponent
```

### Exemplo de Teste

```typescript
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store token on login', () => {
    // Implementar teste
  });
});
```

## 🔄 Integração com Backend

### Configuração da API

A URL da API é configurada em `src/environments/environment.ts`:

```typescript
export const environment = {
  apiUrl: 'http://localhost:3000/api',
};
```

### Endpoints Utilizados

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| POST | `/api/auth/login` | Login do usuário | Não | - |
| GET | `/api/auth/me` | Dados do usuário logado | Sim | - |
| GET | `/api/user` | Listar todos os usuários | Sim | ADMIN |

### Headers Enviados

Todas as requisições autenticadas incluem:
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Tratamento de Erros

O ErrorInterceptor trata automaticamente:
- 401: Logout + redireciona para login
- 403: Alerta + redireciona para dashboard
- 429: Mensagem de rate limit
- 500: Mensagem de erro do servidor

## 🚀 Deploy para Produção

### Build

```bash
npm run build
```

O build gera os arquivos otimizados em `dist/`:
- Código minificado
- Tree shaking
- Lazy loading
- Hash nos arquivos para cache busting

### Configuração de Produção

1. **Edite `src/environments/environment.prod.ts`:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.seudominio.com/api',  // URL do backend em produção
  apiTimeout: 30000,
  tokenKey: 'auth_token',
  userKey: 'user_data',
};
```

2. **Configure CORS no backend** para aceitar requisições do domínio do frontend

3. **Configure HTTPS** (obrigatório para produção)

### Servidor Web

Sirva os arquivos de `dist/` com qualquer servidor web:

**Nginx:**
```nginx
server {
  listen 80;
  server_name seudominio.com;

  root /var/www/frontend/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;  # Suporte a rotas do Angular
  }
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 📚 Recursos Adicionais

- [Documentação do Angular](https://angular.dev)
- [Signals no Angular](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/components/importing)
- [Guards Funcionais](https://angular.dev/guide/routing/common-router-tasks#preventing-unauthorized-access)
- [HTTP Interceptors Funcionais](https://angular.dev/guide/http/interceptors)

## 🤝 Contribuindo

1. Siga as boas práticas descritas neste README
2. Escreva testes para novas features
3. Use TypeScript strict mode
4. Documente componentes e serviços complexos
5. Mantenha a estrutura de pastas organizada

## 📄 Licença

[MIT licensed](../LICENSE)
