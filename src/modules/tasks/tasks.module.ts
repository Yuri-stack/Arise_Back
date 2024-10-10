import { Module } from "@nestjs/common";
import { TasksService } from "./services/tasks.service";
import { TasksController } from "./controller/tasks.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserService } from "../users/services/user.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [PrismaModule, JwtModule],
    providers: [TasksService, UserService],
    controllers: [TasksController],
})

export class TasksModule { }