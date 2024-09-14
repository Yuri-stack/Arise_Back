import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { TaskDTO } from "../entities/taskDTO.entity";
import { PrismaService } from "src/prisma/prisma.service";
import { difficultyMap } from "src/constants/task.constants";

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
        const difficultUpdated: number = difficultyMap[task.type] || 0;

        return await this.prisma.tasks.create({
            data: {
                ...task,
                difficult: difficultUpdated,
                status: "Pendente"
            }
        });
    }

    async update(task: TaskDTO): Promise<TaskDTO> {
        let taskSearched: TaskDTO = await this.findById(task.id);
        const tiposValidos = ['Diária', 'Semanal', 'Mensal', 'Emergente'];

        if (!taskSearched || !task.id)
            throw new HttpException("Tarefa não encontrada!", HttpStatus.NOT_FOUND);

        if (!tiposValidos.includes(task.type)) {
            throw new HttpException("Tipo de Tarefa inválido!", HttpStatus.NOT_FOUND);
        }

        return await this.prisma.tasks.update({
            where: { id: task.id },
            data: task
        });
    }

    async delete(taskId: string): Promise<void> {
        let taskSearched: TaskDTO = await this.findById(taskId);

        if (!taskSearched || !taskId)
            throw new HttpException("Tarefa não existe!", HttpStatus.NOT_FOUND);

        await this.prisma.tasks.delete({ where: { id: taskId } });
    }

    async completeTask(taskId: string) {
        let taskSearched: TaskDTO = await this.findById(taskId);

        if (!taskSearched || !taskId)
            throw new HttpException("A tarefa não existe!", HttpStatus.NOT_FOUND);

        return await this.prisma.tasks.update({
            where: { id: taskId },
            data: {
                ...taskSearched,
                status: "Completa"
            }
        })

    }
}