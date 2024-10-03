import { Module } from "@nestjs/common";
import { TasksService } from "./services/tasks.service";
import { TasksController } from "./controller/tasks.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserService } from "../users/services/user.service";

@Module({
    imports: [PrismaModule],
    providers: [TasksService, UserService],
    controllers: [TasksController],
    exports: []
})

export class TasksModule { }