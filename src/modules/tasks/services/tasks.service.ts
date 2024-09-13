import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Task } from "../entities/tasks.entity";
import { PrismaService } from "src/prisma/prisma.service";

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
        return await this.prisma.tasks.create({ data: task });
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
            throw new HttpException("Tarefa não existente!", HttpStatus.NOT_FOUND);

        await this.prisma.tasks.delete({ where: { id: taskId } });
    }
}