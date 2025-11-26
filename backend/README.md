# Backend API

API backend construída com [NestJS](https://nestjs.com/), TypeORM e PostgreSQL, seguindo uma arquitetura modular com classes genéricas reutilizáveis.

## Estrutura do Projeto

```
backend/
├── database/
│   ├── migrations/          # Migrations do TypeORM
│   ├── dbconnect.ts         # Helpers de conexão com BD
│   └── ormconfig.ts         # Configuração do TypeORM
├── src/
│   ├── core/
│   │   ├── architecture/    # Classes base reutilizáveis
│   │   │   ├── abstract.model.ts
│   │   │   ├── abstract.dto.ts
│   │   │   ├── generic-service.ts
│   │   │   ├── generic-controller.ts
│   │   │   └── index.ts
│   │   ├── auth/            # Módulo de autenticação JWT
│   │   │   ├── decorators/   # @Public(), @CurrentUser()
│   │   │   ├── guards/       # JwtAuthGuard (global)
│   │   │   ├── strategies/   # JwtStrategy
│   │   │   └── dto/
│   │   └── scripts/         # Scripts utilitários
│   │       ├── generate-resource.ts
│   │       ├── seed-admin.ts
│   │       └── run-migrations.ts
│   ├── models/              # Entities do TypeORM (centralizadas)
│   │   ├── user.entity.ts
│   │   ├── product.entity.ts
│   │   └── ...
│   ├── resources/           # Módulos de domínio
│   │   ├── user/
│   │   │   ├── dto/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.module.ts
│   │   ├── product/
│   │   └── ...
│   ├── controllers/         # Controllers globais
│   ├── services/            # Services globais
│   ├── app.module.ts
│   └── main.ts
└── test/
```

## Arquitetura

### Classes Base

O projeto utiliza classes genéricas em `src/core/architecture/` que fornecem funcionalidade CRUD padrão:

#### AbstractModel

Base para todas as entities:

```typescript
export abstract class AbstractModel {
  id: number | string;
}
```

#### AbstractDTO

Base para DTOs com três variantes:

```typescript
// Para respostas (GET) - usa @Exclude/@Expose para controle de campos
@Exclude()
export abstract class AbstractResponseDTO {
  @Expose()
  id: number | string;
}

// Para criação (POST)
export abstract class AbstractCreateDTO {}

// Para atualização (PUT/PATCH)
export abstract class AbstractUpdateDTO {
  id?: number | string;
}
```

#### GenericCrudService

Service genérico com operações CRUD completas:

```typescript
@Injectable()
export class GenericCrudService<T extends AbstractModel> {
  constructor(protected readonly repository: Repository<T>) {}

  async getAll(): Promise<T[]>
  async getById(id: number | string): Promise<T | null>
  async create(data: DeepPartial<T>): Promise<T>
  async update(id: number, data: Partial<T>): Promise<T | null>
  async delete(id: number): Promise<boolean>
  async getPaginated(page?, limit?): Promise<{ data: T[]; total: number }>
}
```

#### GenericCrudController

Controller genérico com endpoints REST e Swagger:

```typescript
@Controller()
export class GenericCrudController<
  T extends AbstractModel,
  ResponseDTO extends AbstractResponseDTO,
  CreateDTO extends AbstractCreateDTO,
  UpdateDTO extends AbstractUpdateDTO,
> {
  // GET /           - Buscar todos
  // GET /paged      - Buscar paginado
  // GET /:id        - Buscar por ID
  // POST /          - Criar
  // PUT /:id        - Atualizar
  // DELETE /:id     - Deletar
}
```

## Gerando Novos Resources

Use o script de geração para criar novos módulos seguindo a arquitetura:

```bash
npm run generate:resource product
npm run generate:resource user-profile
npm run generate:resource order
```

O script cria a seguinte estrutura:

```
src/models/product.entity.ts           # Entity (TypeORM) - centralizada

src/resources/product/
├── dto/
│   ├── create-product.dto.ts          # Extende AbstractCreateDTO
│   ├── update-product.dto.ts          # Usa PartialType
│   ├── product-response.dto.ts        # Extende AbstractResponseDTO
│   └── index.ts
├── product.controller.ts              # Extende GenericCrudController
├── product.service.ts                 # Extende GenericCrudService
└── product.module.ts
```

### Após gerar o resource:

1. **Adicione o módulo no `app.module.ts`:**

```typescript
import { ProductModule } from './resources/product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductModule, // Adicione aqui
  ],
})
export class AppModule {}
```

2. **Complete os campos na entity e DTOs**

3. **Gere a migration:**

```bash
npm run typeorm migration:generate ./database/migrations/CreateProduct -d ./database/ormconfig.ts
npm run migration:up
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev       # Inicia em modo watch
npm run start:debug     # Inicia com debugger

# Build e Produção
npm run build           # Compila o projeto
npm run start:prod      # Inicia em produção

# Testes
npm run test            # Testes unitários
npm run test:watch      # Testes em modo watch
npm run test:cov        # Cobertura de testes
npm run test:e2e        # Testes end-to-end

# Banco de Dados
npm run migration:create [nome]     # Cria migration vazia
npm run migration:generate -- [nome]  # Gera migration a partir das entities
npm run migration:up                # Executa migrations pendentes
npm run migration:revert            # Reverte última migration

# Seeds
npm run seed:admin                  # Cria usuário admin inicial

# Geração de Código
npm run generate:resource [nome]    # Gera novo módulo CRUD

# Qualidade
npm run lint            # Executa ESLint
npm run format          # Formata código com Prettier
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend:

```env
# Servidor
PORT=3000
API_PREFIX=api/v1

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=nome_do_banco

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:4200

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-mude-em-producao
JWT_EXPIRES_IN=7d

# Admin Seed (para criar usuário admin inicial)
ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=SuaSenhaSegura123
```

### Banco de Dados

O projeto usa PostgreSQL com TypeORM. Configuração em `database/ormconfig.ts`.

As entities são automaticamente carregadas de `src/models/*.{ts,js}`.

Para ambiente local com Docker:

```bash
docker-compose up -d
```

### Configuração Inicial

Após configurar as variáveis de ambiente e o banco de dados:

```bash
# 1. Executar migrations
npm run migration:up

# 2. Criar usuário admin inicial
npm run seed:admin
```

## Autenticação JWT

O sistema utiliza autenticação JWT com guard global. **Todos os endpoints são protegidos por padrão**.

### Endpoints de Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/api/auth/login` | Realizar login | Pública |
| GET | `/api/auth/me` | Dados do usuário logado | Requer token |

### Fluxo de Autenticação

1. **Login**: Envie email e senha para `/api/auth/login`
2. **Resposta**: Receba o `access_token` JWT
3. **Requisições**: Inclua o token no header `Authorization: Bearer <token>`

**Exemplo de login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@admin.com", "password": "SuaSenhaSegura123"}'
```

**Resposta:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 1,
  "name": "Administrador",
  "email": "admin@admin.com",
  "role": "ADMIN"
}
```

**Usando o token:**

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Tornando Rotas Públicas

Por padrão, todas as rotas exigem autenticação. Use o decorator `@Public()` para tornar uma rota pública:

```typescript
import { Public } from '../core/auth';

@Controller('products')
export class ProductController {

  // Esta rota é pública (não precisa de token)
  @Public()
  @Get('featured')
  getFeaturedProducts() {
    return this.productService.getFeatured();
  }

  // Esta rota requer autenticação (padrão)
  @Get()
  getAllProducts() {
    return this.productService.getAll();
  }
}
```

Você também pode aplicar `@Public()` em todo o controller:

```typescript
@Public()
@Controller('public-info')
export class PublicInfoController {
  // Todas as rotas deste controller são públicas
}
```

### Obtendo o Usuário Logado

Use o decorator `@CurrentUser()` para acessar os dados do usuário autenticado:

```typescript
import { CurrentUser } from '../core/auth';

@Controller('orders')
export class OrderController {

  @Get('my-orders')
  getMyOrders(@CurrentUser() user: { id: number; email: string; name: string; role: string }) {
    return this.orderService.findByUserId(user.id);
  }

  // Ou pegue apenas um campo específico
  @Post()
  createOrder(
    @CurrentUser('id') userId: number,
    @Body() createOrderDto: CreateOrderDto
  ) {
    return this.orderService.create(userId, createOrderDto);
  }
}
```

### Roles de Usuário e Autorização

Use o decorator `@Roles()` para restringir endpoints por role:

```typescript
import { Roles } from '../core/auth';
import { UserRole } from '../models/user.entity';

@Controller('admin')
export class AdminController {
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  deleteUser(@Param('id') id: number) {
    // Apenas ADMIN pode acessar
  }
}
```

## Segurança

A API implementa múltiplas camadas de proteção:

### Proteções Implementadas

| Proteção | Descrição |
|----------|-----------|
| **SQL Injection** | TypeORM usa queries parametrizadas. **Nunca use queries raw com input do usuário.** |
| **Validação de Input** | `ValidationPipe` global com whitelist. Campos não declarados no DTO são rejeitados. |
| **Senha Forte** | Mínimo 8 caracteres, maiúscula, minúscula, número e caractere especial obrigatórios. |
| **Bcrypt** | Senhas hasheadas com 10 salt rounds. Nunca armazene senhas em texto plano. |
| **Rate Limiting** | Limite global de requests. Login: máx. 5 tentativas/minuto por IP. |
| **Headers de Segurança** | Helmet.js adiciona X-Frame-Options, HSTS, CSP, etc. |
| **CORS** | Configurado via `CORS_ORIGINS`. Em produção, especifique domínios explícitos. |
| **JWT** | Tokens assinados com `JWT_SECRET`. **Use uma chave forte e única em produção.** |
| **RolesGuard** | Controle de acesso por role (ADMIN/USER). |

### Boas Práticas

```bash
# Em produção, NUNCA use valores padrão para:
JWT_SECRET=chave-muito-longa-e-aleatoria-minimo-32-caracteres
DB_PASSWORD=senha-forte-do-banco
ADMIN_PASSWORD=SenhaAdmin@Forte123
```

### Rate Limiting por Endpoint

```typescript
import { Throttle, SkipThrottle } from '@nestjs/throttler';

// Limite customizado (10 requests por minuto)
@Throttle({ short: { ttl: 60000, limit: 10 } })
@Post('sensitive')
sensitiveEndpoint() { }

// Desabilitar rate limit
@SkipThrottle()
@Get('public')
publicEndpoint() { }
```

## API Documentation

A documentação Swagger está disponível em:

```
http://localhost:3000/api/docs
```

## Exemplo de Uso

### Criando um Resource "Product"

1. **Gerar arquivos:**

```bash
npm run generate:resource product
```

2. **Editar a entity (`src/models/product.entity.ts`):**

```typescript
@Entity('products')
export class Product extends AbstractModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

3. **Editar o CreateDTO (`src/resources/product/dto/create-product.dto.ts`):**

```typescript
export class CreateProductDto extends AbstractCreateDTO {
  @ApiProperty({ description: 'Nome do produto' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Preço do produto' })
  @IsNumber()
  @Min(0)
  price: number;
}
```

4. **Editar o ResponseDTO (`src/resources/product/dto/product-response.dto.ts`):**

```typescript
export class ProductResponseDto extends AbstractResponseDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  price: number;

  @Expose()
  @ApiProperty()
  active: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
```

5. **Registrar no app.module.ts e gerar migration**

## Tecnologias

- **NestJS** v11 - Framework Node.js
- **TypeORM** v0.3 - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **Passport + JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Swagger** - Documentação da API
- **class-validator** - Validação de DTOs
- **class-transformer** - Transformação de objetos
- **@nestjs/throttler** - Rate limiting
- **helmet** - Headers de segurança HTTP

## License

[MIT licensed](LICENSE)
