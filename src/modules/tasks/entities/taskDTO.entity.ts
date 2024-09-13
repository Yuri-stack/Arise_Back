import { IsNotEmpty, Length } from "class-validator";

export class TaskDTO {

  id: string;

  @IsNotEmpty({ message: 'O campo nome não pode estar vazio.' })
  @Length(1, 50, {
    message: 'O campo nome deve ter entre 1 e 50 caracteres.',
  })
  name: string

  @IsNotEmpty({ message: 'O campo descrição não pode estar vazio.' })
  @Length(1, 100, {
    message: 'O campo descrição deve ter entre 1 e 100 caracteres.',
  })
  description: string

  difficult?: number
  status?: string
  type: string

  createdAt: Date
}