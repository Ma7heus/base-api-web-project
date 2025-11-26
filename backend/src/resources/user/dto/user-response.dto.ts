import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractResponseDTO } from '../../../core/architecture';

export class UserResponseDto extends AbstractResponseDTO {
  @Expose()
  @ApiProperty({ description: 'ID do registro' })
  id: number;

  // TODO: Adicione suas propriedades aqui (use @Expose() para expor campos)
  // @Expose()
  // @ApiProperty({ description: 'Nome do user' })
  // name: string;

  @Expose()
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;

  getId(): number | string {
    return this.id;
  }
}
