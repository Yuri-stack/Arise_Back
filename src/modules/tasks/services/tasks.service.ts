import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { TaskDTO } from "../entities/taskDTO.entity";
import { PrismaService } from "src/prisma/prisma.service";
import { setExpirationDate, setLevelOfDifficultToTask, validateTypeOfTask } from "src/utils/utilitiesForTasks";

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<TaskDTO[]> {
        return await this.prisma.tasks.findMany();
    }

    async findById(taskId: string): Promise<TaskDTO> {
        return await this.prisma.tasks.findUnique({ where: { id: taskId } })
    }

    async create(task: TaskDTO): Promise<TaskDTO> {
        validateTypeOfTask(task.type)

        return await this.prisma.tasks.create({
            data: {
                ...task,
                difficult: setLevelOfDifficultToTask(task),
                expirationAt: setExpirationDate(task),
                status: "Pendente"
            }
        });
    }

    async update(task: TaskDTO): Promise<TaskDTO> {
        validateTypeOfTask(task.type);

        let taskSearched: TaskDTO = await this.findById(task.id);

        if (!taskSearched || !task.id)
            throw new HttpException("Tarefa não encontrada!", HttpStatus.NOT_FOUND);

        return await this.prisma.tasks.update({
            where: { id: task.id },
            data: {
                ...task,
                difficult: setLevelOfDifficultToTask(task)
            }
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

        if (!taskSearched || !taskId)
            throw new HttpException("A tarefa não existe!", HttpStatus.NOT_FOUND);

        return await this.updateStatusTask(taskId, "Completa")
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
            data: { status: status }
        })
    }
}