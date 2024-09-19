import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserDTO } from "../../users/entities/userDTO.entity";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<UserDTO[]> {
        return await this.prisma.user.findMany();
    }

    async findById(userId: string): Promise<UserDTO> {
        return await this.prisma.user.findUnique({ where: { id: userId } })
    }

    async create(user: UserDTO): Promise<UserDTO> {
        return await this.prisma.user.create({
            data: {
                ...user,
                role: "",
                level: 0,
                progress: 0,
                reachToNextLevel: 0
            }
        });
    }

    async update(user: UserDTO): Promise<UserDTO> {
        let userSearched: UserDTO = await this.findById(user.id);

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
        let userSearched: UserDTO = await this.findById(userId);

        if (!userSearched || !userId)
            throw new HttpException("Usuário não existe!", HttpStatus.NOT_FOUND);

        await this.prisma.user.delete({ where: { id: userId } });
    }
}