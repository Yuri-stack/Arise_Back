import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TaskDTO } from "../entities/taskDTO.entity";
import { TasksService } from "../services/tasks.service";
import { JwtAuthGuard } from "src/modules/auth/guard/jwt-auth.guard";
import { UserService } from "src/modules/users/services/user.service";

@ApiTags("Tarefas - Tasks")
@UseGuards(JwtAuthGuard)
@Controller("/tasks")
export class TasksController {
    constructor(private readonly tasksService: TasksService, private readonly userService: UserService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAllTasks(): Promise<TaskDTO[]> {
        await this.tasksService.updateStatusTaskIfLate();
        return await this.tasksService.findAll();
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    async findTaskById(@Param('id') taskId: string): Promise<TaskDTO> {
        return await this.tasksService.findById(taskId);
    }

    @Get('/status/:status')
    @HttpCode(HttpStatus.OK)
    async listTaskByStatus(@Param('status') status: string): Promise<TaskDTO[]> {
        return await this.tasksService.listTasksByStatus(status);
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
    async completeTask(@Param('id') taskId: string): Promise<object> {
        const taskAccomplished = await this.tasksService.completeTask(taskId);

        await this.userService.getExperienceAndUpdateProgress(taskAccomplished);

        return await this.userService.updateUserProgress(taskAccomplished.user.id);
    }
}