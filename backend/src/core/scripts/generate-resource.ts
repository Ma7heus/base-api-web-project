#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

// Helpers para formatação de nomes
const toPascalCase = (str: string): string =>
  str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

const toCamelCase = (str: string): string => {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

const toKebabCase = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

const toSnakeCase = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();

// Templates
const entityTemplate = (name: string): string => {
  const className = toPascalCase(name);
  const tableName = toSnakeCase(name) + 's';

  return `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AbstractModel } from '../core/architecture';

@Entity('${tableName}')
export class ${className} extends AbstractModel {

  @PrimaryGeneratedColumn()
  id: number;

  // TODO: Adicione suas colunas aqui
  // @Column()
  // name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  getId(): number | string {
    return this.id;
  }
}
`;
};

const createDtoTemplate = (name: string): string => {
  const className = toPascalCase(name);

  return `import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractCreateDTO } from '../../../core/architecture';

export class Create${className}Dto extends AbstractCreateDTO {
  // TODO: Adicione suas propriedades aqui
  // @ApiProperty({ description: 'Nome do ${name}', example: 'Exemplo' })
  // @IsNotEmpty()
  // @IsString()
  // name: string;
}
`;
};

const updateDtoTemplate = (name: string): string => {
  const className = toPascalCase(name);

  return `import { PartialType } from '@nestjs/swagger';
import { Create${className}Dto } from './create-${toKebabCase(name)}.dto';

export class Update${className}Dto extends PartialType(Create${className}Dto) {}
`;
};

const responseDtoTemplate = (name: string): string => {
  const className = toPascalCase(name);

  return `import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractResponseDTO } from '../../../core/architecture';

export class ${className}ResponseDto extends AbstractResponseDTO {
  @Expose()
  @ApiProperty({ description: 'ID do registro' })
  id: number;

  // TODO: Adicione suas propriedades aqui (use @Expose() para expor campos)
  // @Expose()
  // @ApiProperty({ description: 'Nome do ${name}' })
  // name: string;

  @Expose()
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}
`;
};

const dtoIndexTemplate = (name: string): string => {
  const kebabName = toKebabCase(name);

  return `export * from './create-${kebabName}.dto';
export * from './update-${kebabName}.dto';
export * from './${kebabName}-response.dto';
`;
};

const serviceTemplate = (name: string): string => {
  const className = toPascalCase(name);
  const kebabName = toKebabCase(name);

  return `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenericCrudService } from '../../core/architecture';
import { ${className} } from '../../models/${kebabName}.entity';

@Injectable()
export class ${className}Service extends GenericCrudService<${className}> {
  constructor(
    @InjectRepository(${className})
    repository: Repository<${className}>,
  ) {
    super(repository);
  }

  // TODO: Adicione métodos customizados aqui se necessário
}
`;
};

const controllerTemplate = (name: string): string => {
  const className = toPascalCase(name);
  const kebabName = toKebabCase(name);

  return `import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GenericCrudController } from '../../core/architecture';
import { ${className} } from '../../models/${kebabName}.entity';
import { ${className}Service } from './${kebabName}.service';
import {
  Create${className}Dto,
  Update${className}Dto,
  ${className}ResponseDto,
} from './dto';

@ApiTags('${kebabName}')
@Controller('${kebabName}')
export class ${className}Controller extends GenericCrudController<
  ${className},
  ${className}ResponseDto,
  Create${className}Dto,
  Update${className}Dto
> {
  constructor(private readonly ${toCamelCase(name)}Service: ${className}Service) {
    super(${toCamelCase(name)}Service, ${className}ResponseDto);
  }

  // TODO: Adicione endpoints customizados aqui se necessário
}
`;
};

const moduleTemplate = (name: string): string => {
  const className = toPascalCase(name);
  const kebabName = toKebabCase(name);

  return `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${className} } from '../../models/${kebabName}.entity';
import { ${className}Service } from './${kebabName}.service';
import { ${className}Controller } from './${kebabName}.controller';

@Module({
  imports: [TypeOrmModule.forFeature([${className}])],
  controllers: [${className}Controller],
  providers: [${className}Service],
  exports: [${className}Service],
})
export class ${className}Module {}
`;
};

// Função principal
function generateResource(resourceName: string): void {
  const name = toKebabCase(resourceName);
  const className = toPascalCase(resourceName);

  // Caminho base do src
  const srcPath = path.resolve(__dirname, '../../');

  // Paths específicos
  const resourcePath = path.join(srcPath, 'resources', name);
  const modelsPath = path.join(srcPath, 'models');

  console.log(`\n🚀 Gerando resource: ${className}`);
  console.log(`📁 Resource: ${resourcePath}`);
  console.log(`📁 Model: ${modelsPath}\n`);

  // Criar estrutura de pastas
  const folders = [resourcePath, path.join(resourcePath, 'dto'), modelsPath];

  folders.forEach((folder) => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`✅ Pasta criada: ${folder}`);
    }
  });

  // Arquivos a serem gerados
  const files = [
    // Entity em src/models/
    {
      path: path.join(modelsPath, `${name}.entity.ts`),
      content: entityTemplate(name),
      name: 'Entity',
    },
    // DTOs em src/resources/[name]/dto/
    {
      path: path.join(resourcePath, 'dto', `create-${name}.dto.ts`),
      content: createDtoTemplate(name),
      name: 'CreateDTO',
    },
    {
      path: path.join(resourcePath, 'dto', `update-${name}.dto.ts`),
      content: updateDtoTemplate(name),
      name: 'UpdateDTO',
    },
    {
      path: path.join(resourcePath, 'dto', `${name}-response.dto.ts`),
      content: responseDtoTemplate(name),
      name: 'ResponseDTO',
    },
    {
      path: path.join(resourcePath, 'dto', 'index.ts'),
      content: dtoIndexTemplate(name),
      name: 'DTO Index',
    },
    // Service, Controller, Module em src/resources/[name]/
    {
      path: path.join(resourcePath, `${name}.service.ts`),
      content: serviceTemplate(name),
      name: 'Service',
    },
    {
      path: path.join(resourcePath, `${name}.controller.ts`),
      content: controllerTemplate(name),
      name: 'Controller',
    },
    {
      path: path.join(resourcePath, `${name}.module.ts`),
      content: moduleTemplate(name),
      name: 'Module',
    },
  ];

  files.forEach((file) => {
    if (fs.existsSync(file.path)) {
      console.log(`⚠️  Arquivo já existe (ignorado): ${file.name}`);
    } else {
      fs.writeFileSync(file.path, file.content);
      console.log(`✅ ${file.name} criado: ${path.basename(file.path)}`);
    }
  });

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Resource "${className}" criado com sucesso!

📁 Estrutura criada:
   src/models/${name}.entity.ts
   src/resources/${name}/
   ├── dto/
   │   ├── create-${name}.dto.ts
   │   ├── update-${name}.dto.ts
   │   ├── ${name}-response.dto.ts
   │   └── index.ts
   ├── ${name}.controller.ts
   ├── ${name}.service.ts
   └── ${name}.module.ts

📝 Próximos passos:

1. Adicione o módulo no app.module.ts:

   import { ${className}Module } from './resources/${name}/${name}.module';

   @Module({
     imports: [..., ${className}Module],
   })

2. Complete os campos na entity (src/models/${name}.entity.ts) e DTOs

3. Gere a migration:
   npm run typeorm migration:generate ./database/migrations/${className} -d ./database/ormconfig.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
📦 NestJS Resource Generator

Uso:
  npm run generate:resource <nome-do-resource>

Exemplos:
  npm run generate:resource product
  npm run generate:resource user-profile
  npm run generate:resource order

Estrutura gerada:
  src/models/[name].entity.ts          # Entity (TypeORM)
  src/resources/[name]/
  ├── dto/                             # DTOs (Create, Update, Response)
  ├── [name].controller.ts             # Controller (REST endpoints)
  ├── [name].service.ts                # Service (lógica de negócio)
  └── [name].module.ts                 # Module (NestJS)

O script estende automaticamente:
  - GenericCrudService
  - GenericCrudController
  - AbstractModel, AbstractDTO
`);
  process.exit(0);
}

generateResource(args[0]);
