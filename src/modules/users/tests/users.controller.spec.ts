import { PrismaService } from "src/prisma/prisma.service";
import { UserController } from "../controllers/user.controller";
import { execSync } from "child_process";
import { Test, TestingModule } from "@nestjs/testing";

describe("Suíte de Testes da UserController", () => {
    let controller: UserController;
    let prisma: PrismaService;

    beforeAll(async () => {
        // Gera o Prisma Client com base nas configurações de SQLite
        execSync('npx prisma generate --schema=./prisma/schema.sqlite.prisma');

        // Rodar o Prisma DB Push para sincronizar o banco de dados com o schema
        execSync('npx prisma db push --schema=./prisma/schema.sqlite.prisma');
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserController, PrismaService
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
    });

    describe("", async () => {

    });
})