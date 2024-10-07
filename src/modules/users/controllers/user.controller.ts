import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserDto } from "../entities/user.dto.entity";
import { UserService } from "../services/user.service";
import { JwtAuthGuard } from "src/modules/auth/guard/jwt-auth.guard";
import { calculatePointsForNextLevel } from "src/utils/utilitiesForUsers";

@ApiTags("Usuários - Users")
@Controller("/users")
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAllUser(): Promise<UserDto[]> {
        return await this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('id/:id')
    @HttpCode(HttpStatus.OK)
    async findUserById(@Param('id') userId: string): Promise<UserDto> {
        return await this.userService.findById(userId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() user: UserDto): Promise<UserDto> {
        const initialLevel = 1;
        user.reachToNextLevel = calculatePointsForNextLevel(initialLevel);
        return await this.userService.create(user);
    }

    @UseGuards(JwtAuthGuard)
    @Put()
    @HttpCode(HttpStatus.OK)
    async update(@Body() user: UserDto): Promise<UserDto> {
        return this.userService.update(user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') userId: string): Promise<void> {
        return this.userService.delete(userId);
    }
}