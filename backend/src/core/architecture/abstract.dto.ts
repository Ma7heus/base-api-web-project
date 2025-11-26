import { Exclude } from 'class-transformer';

/**
 * DTO base para respostas (GET).
 * Por padrão exclui todos os campos - use @Expose() nos campos que deseja expor.
 */
@Exclude()
export abstract class AbstractResponseDTO {
  //@Expose()
  //id: number | string;

  abstract getId(): number | string;
}

/**
 * DTO base para criação (POST).
 * Extenda e adicione os campos necessários com validações.
 */
export abstract class AbstractCreateDTO {}

/**
 * DTO base para atualização (PUT/PATCH).
 * Extenda e adicione os campos necessários com validações.
 */
export abstract class AbstractUpdateDTO {
  id?: number | string;
}
