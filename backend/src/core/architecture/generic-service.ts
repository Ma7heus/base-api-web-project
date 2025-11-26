import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Repository, DeepPartial } from 'typeorm';
import { AbstractModel } from './abstract.model';

@Injectable()
export class GenericCrudService<T extends AbstractModel> {
  protected readonly logger: Logger;
  protected readonly entityName: string;

  constructor(protected readonly repository: Repository<T>) {
    this.entityName = repository.metadata.name;
    this.logger = new Logger(`${this.entityName}Service`);
  }

  async getAll(): Promise<T[]> {
    try {
      return await this.repository.find();
    } catch (error) {
      this.logger.error(`Erro ao buscar todos os registros`, error);
      throw new InternalServerErrorException('Erro ao buscar registros');
    }
  }

  async getById(id: number | string): Promise<T> {
    if (!id) {
      throw new BadRequestException('ID é obrigatório');
    }

    try {
      const entity = await this.repository.findOneBy({ id } as any);

      if (!entity) {
        throw new NotFoundException(
          `${this.entityName} com ID ${id} não encontrado`,
        );
      }

      return entity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erro ao buscar ${this.entityName} por ID: ${id}`,
        error,
      );
      throw new InternalServerErrorException('Erro ao buscar registro');
    }
  }

  async create(data: DeepPartial<T>): Promise<T> {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Dados para criação são obrigatórios');
    }

    try {
      const entity = this.repository.create(data);
      return await this.repository.save(entity);
    } catch (error) {
      this.logger.error(`Erro ao criar ${this.entityName}`, error);
      throw error; // Deixa o ErrorInterceptor tratar (duplicatas, constraints, etc)
    }
  }

  async update(id: number | string, data: Partial<T>): Promise<T> {
    if (!id) {
      throw new BadRequestException('ID é obrigatório');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Dados para atualização são obrigatórios');
    }

    try {
      const entity = await this.repository.findOneBy({ id } as any);

      if (!entity) {
        throw new NotFoundException(
          `${this.entityName} com ID ${id} não encontrado`,
        );
      }

      Object.assign(entity, data);
      return await this.repository.save(entity);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Erro ao atualizar ${this.entityName} com ID: ${id}`,
        error,
      );
      throw error; // Deixa o ErrorInterceptor tratar
    }
  }

  async delete(id: number | string): Promise<void> {
    if (!id) {
      throw new BadRequestException('ID é obrigatório');
    }

    try {
      const entity = await this.repository.findOneBy({ id } as any);

      if (!entity) {
        throw new NotFoundException(
          `${this.entityName} com ID ${id} não encontrado`,
        );
      }

      await this.repository.remove(entity);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Erro ao deletar ${this.entityName} com ID: ${id}`,
        error,
      );
      throw error; // Deixa o ErrorInterceptor tratar (foreign key constraints, etc)
    }
  }

  async getPaginated(
    page = 1,
    limit = 10,
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (page < 1) {
      throw new BadRequestException('Página deve ser maior que 0');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limite deve ser entre 1 e 100');
    }

    try {
      const [data, total] = await this.repository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Erro ao buscar registros paginados', error);
      throw new InternalServerErrorException('Erro ao buscar registros');
    }
  }

  async exists(id: number | string): Promise<boolean> {
    if (!id) {
      return false;
    }

    try {
      const count = await this.repository.count({ where: { id } as any });
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Erro ao verificar existência de ${this.entityName} com ID: ${id}`,
        error,
      );
      return false;
    }
  }
}
