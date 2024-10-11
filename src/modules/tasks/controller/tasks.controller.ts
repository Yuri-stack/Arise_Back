import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { TaskEntity } from "../entities/task.entity";
import { TasksService } from "../services/tasks.service";
import { JwtAuthGuard } from "src/modules/auth/guard/jwt-auth.guard";
import { UserService } from "src/modules/users/services/user.service";
import { createMessage } from 'src/utils/utilitiesGlobal';
import { Roles } from "src/common/decorators/roles.decorator";

@ApiTags("Tarefas - Tasks")
@UseGuards(JwtAuthGuard)
@Controller("/tasks")
@ApiBearerAuth()
export class TasksController {
    constructor(private readonly tasksService: TasksService, private readonly userService: UserService) { }

    @Get()
    @Roles("admin")
    @HttpCode(HttpStatus.OK)
    async findAllTasks(): Promise<TaskEntity[]> {
        await this.tasksService.updateStatusTaskIfLate();
        await this.tasksService.reloadDailyTasksUntilReachExpiration();

        return await this.tasksService.findAll();
    }

    @Get('/owner/:ownerId')
    @HttpCode(HttpStatus.OK)
    async findAllMyTasks(@Param('ownerId') ownerId: string) {
        await this.tasksService.updateStatusTaskIfLate();
        await this.tasksService.reloadDailyTasksUntilReachExpiration();

        const tasksLate = await this.tasksService.countTasksLate();
        const myTasks = await this.tasksService.findAllByOwner(ownerId);

        return { tasksLate, myTasks }
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    async findTaskById(@Param('id') taskId: string): Promise<TaskEntity> {
        return await this.tasksService.findById(taskId);
    }

    @Get('/status/:status')
    @HttpCode(HttpStatus.OK)
    async listTaskByStatus(@Param('status') status: string): Promise<TaskEntity[]> {
        return await this.tasksService.listTasksByStatus(status);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() task: TaskEntity): Promise<TaskEntity> {
        return await this.tasksService.create(task);
    }

    @Put()
    @HttpCode(HttpStatus.OK)
    async update(@Body() task: TaskEntity): Promise<TaskEntity> {
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
        const taskAccomplished: TaskEntity = await this.tasksService.completeTask(taskId);

        await this.userService.getExperienceAndUpdateProgress(taskAccomplished);

        const user = await this.userService.checkProgressToLevelUp(taskAccomplished.user.id);

        if (user) {
            const { username, level } = user;
            return createMessage(`Parabéns ${username}! Você avançou para o nível ${level}`);
        }

        return createMessage(`Tarefa Concluída`);
    }
}