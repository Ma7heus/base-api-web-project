import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GenericCrudController } from '../../core/architecture';
import { User, UserRole } from '../../models/user.entity';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { Roles } from '../../core/auth/decorators/roles.decorator';

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

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Buscar todos os usuários (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Usuários encontrados com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getAll(): Promise<UserResponseDto[]> {
    return super.getAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar novo usuário (apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async create(@Body() createDto: CreateUserDto): Promise<UserResponseDto> {
    return super.create(createDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar usuário (apenas ADMIN)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return super.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deletar usuário (apenas ADMIN)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário deletado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return super.delete(id);
  }
}
