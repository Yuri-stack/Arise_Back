import { Module } from "@nestjs/common";
import { TasksService } from "./services/tasks.service";
import { TasksController } from "./controller/tasks.controller";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    providers: [TasksService],
    controllers: [TasksController],
    exports: []
})

export class TasksModule { }