import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractCreateDTO } from '../../../core/architecture';

export class CreateUserDto extends AbstractCreateDTO {
  id: number;

  @ApiProperty({ description: 'Nome do usuário', example: 'Exemplo' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Login do usuário', example: 'exemplo_login' })
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty({ description: 'Senha do usuário', example: 'senha123' })
  password: string;

  @ApiProperty({ description: 'Email do usuário', example: 'teste@gmail.com' })
  @IsNotEmpty()
  @IsString()
  email: string;
}
