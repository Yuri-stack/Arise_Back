import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserService } from "./services/user.service";
import { UserController } from "./controller/user.controller";

@Module({
    imports: [PrismaModule],
    providers: [UserService],
    controllers: [UserController],
    exports: []
})

export class UserModule { }