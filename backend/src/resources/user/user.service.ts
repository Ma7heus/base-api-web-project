import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenericCrudService } from '../../core/architecture';
import { User } from '../../models/user.entity';

@Injectable()
export class UserService extends GenericCrudService<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository);
  }

  // TODO: Adicione métodos customizados aqui se necessário
}
