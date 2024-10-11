import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { TaskEntity } from "../entities/task.entity";
import { PrismaService } from "src/prisma/prisma.service";
import { setExpirationDate, setLevelOfDifficultToTask, validateTypeOfTask } from "src/utils/utilitiesForTasks";
import { UserEntity } from "src/modules/users/entities/user.entity";

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<TaskEntity[]> {
        return await this.prisma.tasks.findMany({ include: { user: true } });
    }

    async findAllByOwner(ownerId: string): Promise<Omit<TaskEntity, 'user' | 'userId'>[]> {
        return await this.prisma.tasks.findMany({ where: { userId: ownerId } })
    }

    async findById(taskId: string): Promise<TaskEntity> {
        return await this.prisma.tasks.findUnique({ where: { id: taskId }, include: { user: true } })
    }

    async listTasksByStatus(status: string): Promise<TaskEntity[]> {
        return await this.prisma.tasks.findMany({ where: { status }, include: { user: true } });
    }

    async create(task: TaskEntity): Promise<TaskEntity> {
        validateTypeOfTask(task.type)

        let userOwner: UserEntity = await this.prisma.user.findUnique({ where: { id: task.user.id } })

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

    async update(task: TaskEntity): Promise<TaskEntity> {
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
        let taskSearched: TaskEntity = await this.findById(taskId);

        if (!taskSearched || !taskId)
            throw new HttpException("Tarefa não existe!", HttpStatus.NOT_FOUND);

        await this.prisma.tasks.delete({ where: { id: taskId } });
    }

    async completeTask(taskId: string): Promise<TaskEntity> {
        let taskSearched: TaskEntity = await this.findById(taskId);

        if (taskSearched.status === "Completa")
            throw new HttpException("A tarefa já foi Concluída!", HttpStatus.BAD_REQUEST);

        if (!taskSearched || !taskId)
            throw new HttpException("A tarefa não existe!", HttpStatus.NOT_FOUND);

        return await this.updateStatusTask(taskId, "Completa");
    }

    async updateStatusTaskIfLate(): Promise<void> {
        const actualDate: Date = new Date();
        const tasks: TaskEntity[] = await this.findAll();

        const updatedTasks = tasks.map(async task => {
            const expirationDate: Date = new Date(task.expirationAt);

            // Verifica se a tarefa está atrasada e não foi concluída
            if ((actualDate > expirationDate) && task.status !== "Completa") {
                await this.updateStatusTask(task.id, "Atrasada");
            }

        })
        await Promise.all(updatedTasks);
    }

    async countTasksLate(): Promise<number> {
        const quantity: number = await this.prisma.tasks.count({ where: { status: 'Atrasada' } });
        return quantity;
    }

    async reloadDailyTasksUntilReachExpiration(): Promise<void> {
        const actualDate: Date = new Date();
        const tasks: TaskEntity[] = await this.findAll();

        const updatedDailyTasks = tasks.map(async task => {

            if ((actualDate === new Date(task.expirationAt)) && task.status === "Completa" && task.type === "Diária") {
                task.createdAt = new Date(task.expirationAt + 1);
                await this.update(task);
            }

        })
        await Promise.all(updatedDailyTasks);

    }

    private async updateStatusTask(taskId: string, status: string): Promise<TaskEntity> {
        return await this.prisma.tasks.update({
            where: { id: taskId },
            data: { status: status },
            include: { user: true }
        })
    }
}