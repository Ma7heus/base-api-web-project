import {
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Controller,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  instanceToPlain,
  plainToInstance,
  type ClassConstructor,
} from 'class-transformer';
import { GenericCrudService } from './generic-service';
import { AbstractModel } from './abstract.model';
import {
  AbstractResponseDTO,
  AbstractCreateDTO,
  AbstractUpdateDTO,
} from './abstract.dto';

@Controller()
export class GenericCrudController<
  T extends AbstractModel,
  ResponseDTO extends AbstractResponseDTO,
  CreateDTO extends AbstractCreateDTO,
  UpdateDTO extends AbstractUpdateDTO,
> {
  constructor(
    private readonly service: GenericCrudService<T>,
    private readonly responseDtoClass: ClassConstructor<ResponseDTO>,
  ) {}

  /**
   * Converte uma entidade para o DTO de resposta.
   * Usa @Exclude/@Expose definidos no DTO.
   */
  protected toResponseDto(entity: T): ResponseDTO {
    return plainToInstance(this.responseDtoClass, entity, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Converte uma lista de entidades para DTOs de resposta.
   */
  protected toResponseDtoList(entities: T[]): ResponseDTO[] {
    return entities.map((entity) => this.toResponseDto(entity));
  }

  /**
   * Converte um DTO de criação/atualização para plain object.
   * Remove campos undefined/null se necessário.
   */
  protected toPlainObject<D>(dto: D): Record<string, unknown> {
    return instanceToPlain(dto) as Record<string, unknown>;
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar todos os registros' })
  @ApiResponse({
    status: 200,
    description: 'Registros encontrados com sucesso',
  })
  async getAll(): Promise<ResponseDTO[]> {
    const entities = await this.service.getAll();
    return this.toResponseDtoList(entities);
  }

  @Get('paged')
  @ApiOperation({ summary: 'Buscar registros paginados' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Registros por página (padrão: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Registros paginados encontrados com sucesso',
  })
  async getPaginated(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<{ data: ResponseDTO[]; total: number }> {
    const result = await this.service.getPaginated(page, limit);
    return {
      data: this.toResponseDtoList(result.data),
      total: result.total,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar registro por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do registro' })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Registro não encontrado' })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<ResponseDTO> {
    const entity = await this.service.getById(id);
    return this.toResponseDto(entity);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo registro' })
  @ApiResponse({ status: 201, description: 'Registro criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createDto: CreateDTO): Promise<ResponseDTO> {
    const data = this.toPlainObject(createDto);
    const created = await this.service.create(
      data as Parameters<typeof this.service.create>[0],
    );
    return this.toResponseDto(created);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar registro existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do registro' })
  @ApiResponse({
    status: 200,
    description: 'Registro atualizado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Registro não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDTO,
  ): Promise<ResponseDTO> {
    const data = this.toPlainObject(updateDto);
    const updated = await this.service.update(id, data as Partial<T>);
    return this.toResponseDto(updated);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar registro' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do registro' })
  @ApiResponse({ status: 200, description: 'Registro deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Registro não encontrado' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.service.delete(id);
    return { message: 'Registro deletado com sucesso' };
  }
}
