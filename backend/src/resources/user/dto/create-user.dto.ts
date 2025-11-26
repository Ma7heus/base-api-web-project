import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractCreateDTO } from '../../../core/architecture';

export class CreateUserDto extends AbstractCreateDTO {
  id: number;

  @ApiProperty({ description: 'Nome do usuário', example: 'Exemplo' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  @MinLength(2, { message: 'O nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiProperty({ description: 'Login do usuário', example: 'exemplo_login' })
  @IsNotEmpty({ message: 'O login é obrigatório' })
  @IsString({ message: 'O login deve ser uma string' })
  @MinLength(3, { message: 'O login deve ter no mínimo 3 caracteres' })
  @MaxLength(50, { message: 'O login deve ter no máximo 50 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'O login deve conter apenas letras, números e underscore',
  })
  login: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 8 caracteres, deve conter maiúscula, minúscula, número e caractere especial)',
    example: 'Senha@123',
  })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @MaxLength(128, { message: 'A senha deve ter no máximo 128 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'A senha deve conter pelo menos: 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial (@$!%*?&)',
  })
  password: string;

  @ApiProperty({ description: 'Email do usuário', example: 'teste@gmail.com' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({}, { message: 'O email deve ser um endereço válido' })
  @MaxLength(255, { message: 'O email deve ter no máximo 255 caracteres' })
  email: string;
}
