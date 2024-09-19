import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class UserDTO {
    id: string;

    @IsNotEmpty({ message: 'O campo Nome de Usuário não pode estar vazio.' })
    @Length(1, 50, {
        message: 'O campo Nome de Usuário deve ter entre 1 e 50 caracteres.',
    })
    username: string;

    @IsNotEmpty({ message: 'O campo e-mail não pode estar vazio.' })
    @IsEmail({}, { message: 'Insira um e-mail válido!' })
    email: string;

    role?: string;
    level?: number;

    @IsNotEmpty({ message: 'O campo foto não pode estar vazio.' })
    @Length(1, 500, {
        message: 'O campo foto deve ter entre 1 e 500 caracteres.',
    })
    photo: string;

    progress?: number;
    reachToNextLevel?: number;
}