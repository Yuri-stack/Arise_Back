import { Prisma } from "@prisma/client";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { PrismaService } from "src/prisma/prisma.service";
import { UserDTO } from "../../users/entities/userDTO.entity";
import { TaskDTO } from "src/modules/tasks/entities/taskDTO.entity";
import { calculatePointsForNextLevel, isValidImage } from "src/utils/utilitiesForUsers";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<UserDTO[]> {
        return await this.prisma.user.findMany({ include: { tasks: true } })
    }

    async findById(userId: string): Promise<UserDTO> {
        return await this.prisma.user.findUnique({ where: { id: userId }, include: { tasks: true } })
    }

    async create(user: UserDTO): Promise<UserDTO> {
        const [emailSearched, usernameSearched] = await Promise.all([
            this.findUserByField("email", user.email),
            this.findUserByField("username", user.username)
        ]);

        if (emailSearched)
            throw new HttpException("Email já cadastrado!", HttpStatus.BAD_REQUEST);

        if (usernameSearched)
            throw new HttpException("Seu nome de Player já foi cadastrado!", HttpStatus.BAD_REQUEST);

        if (user.photo && !isValidImage(user.photo)) {
            throw new HttpException("Sua imagem é inválida! Por favor, insira um dos seguintes formatos: 'jpg', 'jpeg', 'png'", HttpStatus.BAD_REQUEST);
        }

        return await this.prisma.user.create({
            data: {
                ...user
            }
        });
    }

    async update(user: UserDTO): Promise<UserDTO> {
        const [emailSearched, usernameSearched, userSearched] = await Promise.all([
            this.findUserByField("email", user.email),
            this.findUserByField("username", user.username),
            this.findUserByField("id", user.id)
        ]);

        if (!userSearched || !user.id)
            throw new HttpException("Usuário não encontrado!", HttpStatus.NOT_FOUND);

        if (usernameSearched)
            throw new HttpException("Seu nome de Player já foi cadastrado!", HttpStatus.BAD_REQUEST);

        if (emailSearched)
            throw new HttpException("Email já cadastrado!", HttpStatus.BAD_REQUEST);

        return await this.prisma.user.update({
            where: { id: user.id },
            data: {
                email: user.email,
                username: user.username,
                photo: user.photo,
            }
        });
    }

    async delete(userId: string): Promise<void> {
        let userSearched: UserDTO = await this.findUserByField("id", userId);

        if (!userSearched || !userId)
            throw new HttpException("Usuário não existe!", HttpStatus.NOT_FOUND);

        await this.prisma.user.delete({ where: { id: userId } });
    }

    async getExperienceAndUpdateProgress(task: TaskDTO) {
        let user: UserDTO = task.user;

        if (task.status !== "Completa") {
            throw new HttpException("Tarefa não concluída", HttpStatus.BAD_REQUEST);
        }

        const updatedProgress = user.progress + task.difficult;

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                progress: updatedProgress
            }
        });

    }

    async updateUserProgress(userId: string): Promise<object> {
        const user = await this.findUserByField("id", userId);

        // Verifico se a qtd atual de pontos é > ou = a qtd necessária para aumentar de nível
        if (user.progress >= user.reachToNextLevel) {
            const [newProgress, newLevel, newReachToNextLevel] = await this.levelUp(user);

            const { username, level } = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    progress: newProgress,
                    level: newLevel,
                    reachToNextLevel: newReachToNextLevel
                }
            });

            return {
                title: `Mensagem do Sistema`,
                message: `Parabéns ${username}! Você avançou para o nível ${level}`
            }
        }

        return {
            title: `Mensagem do Sistema`,
            message: `Tarefa Concluída`
        }
    }

    private async findUserByField(field: keyof UserDTO, value: string): Promise<UserDTO> {
        const allowedFields = ["id", "username", "email"];

        if (!allowedFields.includes(field)) throw new Error('Campo de pesquisa inválido');

        const user = await this.prisma.$queryRaw<UserDTO>(
            Prisma.sql`SELECT * FROM USER WHERE ${Prisma.raw(field)} = ${value};`
        );

        return user[0];
    }

    private async levelUp(user: UserDTO): Promise<number[]> {
        // Pega o nível atual do usuário
        const currentLevel: number = user.level;
        // Pega o valor antigo para alcançar o próximo nível
        const oldReachToNextLevel: number = user.reachToNextLevel;

        // Calculo a nova quantidade de pontos para o próximo nível
        const newReachToNextLevel: number = calculatePointsForNextLevel(currentLevel);
        // Calculo a nova quantidade de pontos da barra de progresso após o processo de aumento de nível
        const newProgress: number = user.progress - oldReachToNextLevel;
        // Atualizo o nível do usuário
        const newLevel: number = user.level + 1;

        return [newProgress, newLevel, newReachToNextLevel];
    }
}