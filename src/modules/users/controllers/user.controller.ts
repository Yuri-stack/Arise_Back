import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put } from "@nestjs/common";
import { UserDTO } from "../entities/userDTO.entity";
import { UserService } from "../services/user.service";

@Controller("/users")
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAllUser(): Promise<UserDTO[]> {
        return await this.userService.findAll();
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    async findUserById(@Param('id') userId: string): Promise<UserDTO> {
        return await this.userService.findById(userId)
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() task: UserDTO): Promise<UserDTO> {
        return await this.userService.create(task);
    }

    @Put()
    @HttpCode(HttpStatus.OK)
    async update(@Body() task: UserDTO): Promise<UserDTO> {
        return this.userService.update(task);
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') userId: string): Promise<void> {
        return this.userService.delete(userId);
    }
}