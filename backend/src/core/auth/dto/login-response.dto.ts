import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token!: string;

  @ApiProperty({
    description: 'ID do usuário',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'Administrador',
  })
  name!: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'admin@admin.local',
  })
  email!: string;

  @ApiProperty({
    description: 'Role do usuário',
    example: 'ADMIN',
  })
  role!: string;
}
