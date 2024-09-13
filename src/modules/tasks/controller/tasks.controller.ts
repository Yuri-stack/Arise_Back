import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { TasksService } from "../services/tasks.service";
import { TaskDTO } from "../entities/taskDTO.entity";

@Controller("/tasks")
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAllTasks(): Promise<TaskDTO[]> {
        return await this.tasksService.findAll();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() task: TaskDTO): Promise<TaskDTO> {
        return await this.tasksService.create(task);
    }

    @Put()
    @HttpCode(HttpStatus.OK)
    async update(@Body() task: TaskDTO): Promise<TaskDTO> {
        return this.tasksService.update(task);
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') taskId: string): Promise<void> {
        return this.tasksService.delete(taskId);
    }

}