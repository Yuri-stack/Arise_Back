import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { TaskDTO } from "../entities/taskDTO.entity";
import { PrismaService } from "src/prisma/prisma.service";
import { setExpirationDate, setLevelOfDifficultToTask, validateTypeOfTask } from "src/utils/utilitiesForTasks";
import { UserDTO } from "src/modules/users/entities/userDTO.entity";

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<TaskDTO[]> {
        return await this.prisma.tasks.findMany({ include: { user: true } });
    }

    async findById(taskId: string): Promise<TaskDTO> {
        return await this.prisma.tasks.findUnique({ where: { id: taskId }, include: { user: true } })
    }

    async listTasksByStatus(status: string): Promise<TaskDTO[]> {
        return await this.prisma.tasks.findMany({ where: { status }, include: { user: true } });
    }

    async create(task: TaskDTO): Promise<TaskDTO> {
        validateTypeOfTask(task.type)

        let userOwner: UserDTO = await this.prisma.user.findUnique({ where: { id: task.user.id } })

        if (!userOwner)
            throw new HttpException("Usuário incorreto ou inexistente", HttpStatus.NOT_FOUND);

        return await this.prisma.tasks.create({
            data: {
                ...task,
                difficult: setLevelOfDifficultToTask(task),
                expirationAt: setExpirationDate(task),
                status: "Pendente",
                user: {
                    connect: { id: task.user.id }
                }
            },
            include: { user: true }
        });
    }

    async update(task: TaskDTO): Promise<TaskDTO> {
        validateTypeOfTask(task.type);

        const [taskSearched, userOwner] = await Promise.all([
            this.findById(task.id),
            this.prisma.user.findUnique({ where: { id: task.user.id } })
        ])

        if (!taskSearched || !task.id)
            throw new HttpException("Tarefa não encontrada!", HttpStatus.NOT_FOUND);

        if (!userOwner)
            throw new HttpException("Usuário incorreto ou inexistente", HttpStatus.NOT_FOUND);

        return await this.prisma.tasks.update({
            where: { id: task.id },
            data: {
                ...task,
                difficult: setLevelOfDifficultToTask(task),
                user: {
                    connect: { id: task.user.id }
                }
            },
            include: { user: true }
        });
    }

    async delete(taskId: string): Promise<void> {
        let taskSearched: TaskDTO = await this.findById(taskId);

        if (!taskSearched || !taskId)
            throw new HttpException("Tarefa não existe!", HttpStatus.NOT_FOUND);

        await this.prisma.tasks.delete({ where: { id: taskId } });
    }

    async completeTask(taskId: string): Promise<TaskDTO> {
        let taskSearched: TaskDTO = await this.findById(taskId);

        if (taskSearched.status === "Completa")
            throw new HttpException("A tarefa já foi Concluída!", HttpStatus.BAD_REQUEST);

        if (!taskSearched || !taskId)
            throw new HttpException("A tarefa não existe!", HttpStatus.NOT_FOUND);

        return await this.updateStatusTask(taskId, "Completa");
    }

    async updateStatusTaskIfLate(): Promise<void> {
        const actualDate: Date = new Date();
        const tasks = await this.findAll();

        const updatedPromises = tasks.map(async task => {
            const expirationDate = new Date(task.expirationAt);

            // Verifica se a tarefa está atrasada e não foi concluída
            if ((actualDate > expirationDate) && task.status !== "Completa") {
                await this.updateStatusTask(task.id, "Atrasada");
            }

        })
        await Promise.all(updatedPromises);
    }

    private async updateStatusTask(taskId: string, status: string): Promise<TaskDTO> {
        return await this.prisma.tasks.update({
            where: { id: taskId },
            data: { status: status },
            include: { user: true }
        })
    }
}