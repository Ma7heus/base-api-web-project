import { Injectable } from '@nestjs/common';
import { Repository, DeepPartial } from 'typeorm';
import { AbstractModel } from './abstract.model';

@Injectable()
export class GenericCrudService<T extends AbstractModel> {
  constructor(protected readonly repository: Repository<T>) {}

  async getAll(): Promise<T[]> {
    console.log('Fetching all', this.repository.target);
    return this.repository.find();
  }

  async getById(id: number | string): Promise<T | null> {
    return this.repository.findOneBy({ id } as any);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: Partial<T>): Promise<T | null> {
    const entity = await this.repository.findOneBy({ id } as any);
    if (!entity) return null;
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  async getPaginated(
    page = 1,
    limit = 10,
  ): Promise<{ data: T[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }
}
