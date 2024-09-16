import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put } from "@nestjs/common";
import { TasksService } from "../services/tasks.service";
import { TaskDTO } from "../entities/taskDTO.entity";

@Controller("/tasks")
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAllTasks(): Promise<TaskDTO[]> {
        await this.tasksService.updateStatusTaskIfLate();
        return await this.tasksService.findAll();
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    async findTaskById(@Param('id') taskId: string): Promise<TaskDTO> {
        return await this.tasksService.findById(taskId)
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

    @Patch('/:id')
    @HttpCode(HttpStatus.OK)
    async completeTask(@Param('id') taskId: string): Promise<TaskDTO> {
        return this.tasksService.completeTask(taskId);
    }
}