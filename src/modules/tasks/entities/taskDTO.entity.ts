import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, Length } from "class-validator";
import { UserDTO } from "src/modules/users/entities/userDTO.entity";

export class TaskDTO {

  @ApiPropertyOptional()
  id: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'O campo nome não pode estar vazio.' })
  @Length(1, 50, {
    message: 'O campo nome deve ter entre 1 e 50 caracteres.',
  })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'O campo descrição não pode estar vazio.' })
  @Length(1, 100, {
    message: 'O campo descrição deve ter entre 1 e 100 caracteres.',
  })
  description: string;

  @ApiPropertyOptional()
  difficult?: number;

  @ApiPropertyOptional()
  status?: string;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  expirationAt?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'O campo Usuário é Obrigatório' })
  user: UserDTO;
}