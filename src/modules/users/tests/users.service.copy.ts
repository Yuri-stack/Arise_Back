
import { execSync } from "child_process";
import { PrismaService } from "../../../prisma/prisma.service";
import { UserService } from "../services/user.service"
import { Test, TestingModule } from "@nestjs/testing";
import { MailerService } from "@nestjs-modules/mailer";

const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue({ success: true }), // Simula o comportamento do método sendMail
};

describe('Teste Unitário UserService', () => {
    let service: UserService;
    let prisma: PrismaService;

    beforeAll(async () => {
        // Sobrescreve a variável de ambiente DATABASE_URL para usar SQLite em memória
        // process.env.DATABASE_PROVIDER = 'sqlite';
        // process.env.DATABASE_URL = 'file:memory?mode=memory&cache=shared';

        // Gera o Prisma Client com base nas configurações de SQLite
        execSync('npx prisma generate --schema=./prisma/schema.sqlite.prisma');

        // Rodar o Prisma DB Push para sincronizar o banco de dados com o schema
        execSync('npx prisma db push --schema=./prisma/schema.sqlite.prisma');
    })

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PrismaService, UserService, {
                provide: MailerService, useValue: mockMailerService
            }],
        }).compile();


    });

    it('Deveria criar um novo usuário', async () => {
        const createdUser = {
            id: "",
            username: "Usuário Teste",
            email: "usuario@gmail.com",
            photo: "",
            rank: "Iniciante"
        };

        prisma.user.create = jest.fn().mockResolvedValue({ ...createdUser });
        const result = await service.create(createdUser);

        expect(result.id).toBeDefined();
    });
})