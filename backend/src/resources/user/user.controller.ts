import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GenericCrudController } from '../../core/architecture';
import { User } from '../../models/user.entity';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

@ApiTags('user')
@Controller('user')
export class UserController extends GenericCrudController<
  User,
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(private readonly userService: UserService) {
    super(userService, UserResponseDto);
  }

  // TODO: Adicione endpoints customizados aqui se necessário
}
