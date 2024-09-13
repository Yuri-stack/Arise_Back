import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Task } from "../entities/tasks.entity";
import { PrismaService } from "src/prisma/prisma.service";
import { difficultyMap } from "src/constants/task.constants";

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<Task[]> {
        return await this.prisma.tasks.findMany();
    }

    async findById(taskId: string): Promise<Task> {
        return await this.prisma.tasks.findUnique({ where: { id: taskId } })
    }

    async create(task: Task): Promise<Task> {
        const difficultUpdated: string = difficultyMap[task.type] || "0";

        return await this.prisma.tasks.create({
            data: {
                ...task,
                difficult: difficultUpdated,
                status: "Pendente"
            }
        });
    }

    async update(task: Task): Promise<Task> {
        let taskSearched = await this.findById(task.id);

        if (!taskSearched || !task.id)
            throw new HttpException("Tarefa não encontrada!", HttpStatus.NOT_FOUND);

        return await this.prisma.tasks.update({
            where: { id: task.id },
            data: task
        });
    }

    async delete(taskId: string): Promise<void> {
        let taskSearched = await this.findById(taskId);

        if (!taskSearched || !taskId)
            throw new HttpException("Tarefa não existe!", HttpStatus.NOT_FOUND);

        await this.prisma.tasks.delete({ where: { id: taskId } });
    }

    async completionTask(taskId: string) {

    }
}