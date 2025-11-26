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
│   │   └── scripts/         # Scripts utilitários
│   │       ├── generate-resource.ts
│   │       ├── generate-jwt-secret.js
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
npm run migration:generate [nome]   # Gera migration a partir das entities
npm run migration:up                # Executa migrations pendentes
npm run migration:revert            # Reverte última migration

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

# JWT (se aplicável)
JWT_SECRET=sua_chave_secreta
```

### Banco de Dados

O projeto usa PostgreSQL com TypeORM. Configuração em `database/ormconfig.ts`.

As entities são automaticamente carregadas de `src/models/*.{ts,js}`.

Para ambiente local com Docker:

```bash
docker-compose up -d
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
- **Swagger** - Documentação da API
- **class-validator** - Validação de DTOs
- **class-transformer** - Transformação de objetos

## License

[MIT licensed](LICENSE)
