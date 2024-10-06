import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserDTO } from "../entities/userDTO.entity";
import { UserService } from "../services/user.service";
import { calculatePointsForNextLevel } from "src/utils/utilitiesForUsers";

@ApiTags("Usuários - Users")
@Controller("/users")
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAllUser(): Promise<UserDTO[]> {
        return await this.userService.findAll();
    }

    @Get('id/:id')
    @HttpCode(HttpStatus.OK)
    async findUserById(@Param('id') userId: string): Promise<UserDTO> {
        return await this.userService.findById(userId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() user: UserDTO): Promise<UserDTO> {
        const initialLevel = 1;
        user.reachToNextLevel = calculatePointsForNextLevel(initialLevel);
        return await this.userService.create(user);
    }

    @Put()
    @HttpCode(HttpStatus.OK)
    async update(@Body() user: UserDTO): Promise<UserDTO> {
        return this.userService.update(user);
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') userId: string): Promise<void> {
        return this.userService.delete(userId);
    }
}