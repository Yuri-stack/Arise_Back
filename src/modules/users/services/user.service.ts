import { Prisma } from "@prisma/client";
import { MailerService } from "@nestjs-modules/mailer";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { PrismaService } from "src/prisma/prisma.service";
import { UserDto } from "../entities/user.dto.entity";
import { TaskDto } from "src/modules/tasks/entities/task.dto.entity";
import { calculatePointsForNextLevel, isValidImage } from "src/utils/utilitiesForUsers";
import { allowedFieldsForSearching, UserSearchFields } from "../constants/user.constants";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService, private readonly mailService: MailerService) { }

    async findAll(): Promise<UserDto[]> {
        return await this.prisma.user.findMany({ include: { tasks: true } })
    }

    async create(user: UserDto): Promise<UserDto> {
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

    async update(user: UserDto): Promise<UserDto> {
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
        let userSearched: UserDto = await this.findUserByField("id", userId);

        if (!userSearched || !userId)
            throw new HttpException("Usuário não existe!", HttpStatus.NOT_FOUND);

        await this.prisma.user.delete({ where: { id: userId } });
    }

    async getExperienceAndUpdateProgress(task: TaskDto) {
        let user: UserDto = task.user;

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

    async findUserByField(field: UserSearchFields, value: string): Promise<UserDto> {
        if (!allowedFieldsForSearching.includes(field)) throw new Error('Campo de pesquisa inválido');

        const user = await this.prisma.$queryRaw<UserDto>(
            Prisma.sql`SELECT * FROM USER WHERE ${Prisma.raw(field)} = ${value};`
        );

        return user[0];
    }

    async sendLoginLink(to: string, content: string): Promise<void> {
        const text = `
        Seja muito bem vindo, player!
        Você solicitou o login ao sistema. Clique no link abaixo:
            
        Link: ${content}
        `;

        await this.mailService.sendMail({
            from: process.env.EMAIL_HOST,
            to,
            subject: "Link de Acesso - Arise",
            text,
        })
    }

    private async levelUp(user: UserDto): Promise<number[]> {
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