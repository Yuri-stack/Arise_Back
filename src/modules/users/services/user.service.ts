import { Prisma } from "@prisma/client";
import { MailerService } from "@nestjs-modules/mailer";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { PrismaService } from "src/prisma/prisma.service";
import { UserEntity } from "../entities/user.entity";
import { TaskEntity } from "src/modules/tasks/entities/task.entity";
import { calculateNewRank, calculatePointsForNextLevel, isValidImage } from "src/utils/utilitiesForUsers";
import { allowedFieldsForSearching, UserSearchFields } from "../constants/user.constants";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService, private readonly mailService: MailerService) { }

    async findAll(): Promise<UserEntity[]> {
        return await this.prisma.user.findMany({ include: { tasks: true } })
    }

    async create(user: UserEntity): Promise<UserEntity> {
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

    async update(user: UserEntity): Promise<UserEntity> {
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
        let userSearched: UserEntity = await this.findUserByField("id", userId);

        if (!userSearched || !userId)
            throw new HttpException("Usuário não existe!", HttpStatus.NOT_FOUND);

        await this.prisma.user.delete({ where: { id: userId } });
    }

    async getExperienceAndUpdateProgress(task: TaskEntity) {
        let user: UserEntity = task.user;

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

    async checkProgressToLevelUp(userId: string): Promise<{ username: string, level: number }> {
        const user: UserEntity = await this.findUserByField("id", userId);
        let rankUser = user.rank;

        // Verifico se a qtd atual de pontos é > ou = a qtd necessária para aumentar de nível
        if (user.progress >= user.reachToNextLevel) {
            const [newProgress, newLevel, newReachToNextLevel] = this.levelUp(user);

            // Chama a função para verificar rank
            const newRank = calculateNewRank(newLevel);

            // Se newRAnk for !null, atualiza a variavel rankUser
            if (newRank)
                rankUser = newRank;

            const { username, level } = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    progress: newProgress,
                    level: newLevel,
                    reachToNextLevel: newReachToNextLevel,
                    rank: rankUser
                }
            });

            return { username, level }
        }

        return
    }

    async findUserByField(field: UserSearchFields, value: string): Promise<UserEntity> {
        if (!allowedFieldsForSearching.includes(field)) throw new Error('Campo de pesquisa inválido');

        const user = await this.prisma.$queryRaw<UserEntity>(
            Prisma.sql`SELECT * FROM USER WHERE ${Prisma.raw(field)} = ${value};`
        );

        return user[0];
    }

    async sendLoginLink(to: string, content: string): Promise<void> {
        await this.mailService.sendMail({
            to,
            from: '<no-reply@arise.com>',
            subject: "Link de Acesso ao Sistema - Arise",
            html: `
            <h1>Saudações Player!</h1>
            <p>Seu login ao Sistema foi criado com sucesso!</p>
            <p>
                Faça seu primeiro acesso clicando <a href=${content}>aqui</a>.
            </p>
        `
        })
    }

    private levelUp(user: UserEntity): number[] {
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