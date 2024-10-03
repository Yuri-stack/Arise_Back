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
        let userSearched: UserDTO = await this.findUserByField("id", user.id);

        if (!userSearched || !user.id)
            throw new HttpException("Usuário não encontrado!", HttpStatus.NOT_FOUND);

        return await this.prisma.user.update({
            where: { id: user.id },
            data: {
                ...user
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

    // private async levelUp(user: UserDTO) {
    //     // if (user.progress >= user.reachToNextLevel) {
    //     //     user.level += 1;
    //     //     user.progress = user.progress - reachToNextLevel;
    //     // }

    // }

    // async updateUserProgress(user: UserDTO) {
    //     const currentLevel = user.level;
    //     const reachToNextLevel = calculatePointsForNextLevel(currentLevel);

    //     user.reachToNextLevel = reachToNextLevel;

    //     if (user.progress >= user.reachToNextLevel) {
    //         user.level += 1;
    //         user.progress = user.progress - reachToNextLevel;
    //     }

    //     await this.prisma.user.update({
    //         where: { id: user.id },
    //         data: {
    //             ...user
    //         }
    //     });
    // }

    private async findUserByField(field: keyof UserDTO, value: string): Promise<UserDTO> {
        const allowedFields = ["id", "username", "email"];

        if (!allowedFields.includes(field)) throw new Error('Campo de pesquisa inválido');

        const user = await this.prisma.$queryRaw<UserDTO>(
            Prisma.sql`SELECT * FROM USER WHERE ${Prisma.raw(field)} = ${value};`
        );

        return user[0];
    }
}