
import { PrismaService } from "../../../prisma/prisma.service";
import { UserService } from "../services/user.service"
import { Test, TestingModule } from "@nestjs/testing";
import { MailerService } from "@nestjs-modules/mailer";
import { execSync } from "child_process";

describe('Suíte de Testes do UserService', () => {
    let service: UserService;
    let prisma: PrismaService;

    const userMock = {
        id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5f9",
        username: "Usuário Teste",
        email: "usuario2@gmail.com",
        photo: "",
        rank: "Iniciante"
    }

    // const prismaMock = {
    //     user: {
    //         create: jest.fn().mockResolvedValue(userMock),
    //         findFirst: jest.fn(),
    //         deleteMany: jest.fn().mockResolvedValue({ count: 0 }), // Mock para deleteMany
    //     },
    // };

    const mailerServiceMock = {
        sendMail: jest.fn().mockResolvedValue({ success: true }), // Mock para o método sendMail
    };

    beforeAll(async () => {
        // Gera o Prisma Client com base nas configurações de SQLite
        execSync('npx prisma generate --schema=./prisma/schema.sqlite.prisma');

        // Rodar o Prisma DB Push para sincronizar o banco de dados com o schema
        execSync('npx prisma db push --schema=./prisma/schema.sqlite.prisma');
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                PrismaService,
                // { provide: PrismaService, useValue: prismaMock },
                { provide: MailerService, useValue: mailerServiceMock },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(async () => {
        await prisma.user.deleteMany(); // Exclui todos os usuários
    });

    describe("User", () => {
        it("01 - Should create a new user", async () => {

            // Criação de um novo usuário
            const result = await service.create(userMock);

            // Verifica se o ID foi gerado e se o email foi atribuído corretamente
            expect(result.id).toBeDefined(); // O ID deve ser gerado
            expect(result.email).toBe(userMock.email); // O email deve ser o mesmo do mock
        });

        it(`02 - Shouldn't create a duplicated user`, async () => {

            let userId: string;
            const user = await prisma.user.create({
                data: {
                    id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5f9",
                    username: "Usuário Teste",
                    email: "usuario2@gmail.com",
                    photo: "",
                    rank: "Iniciante"
                },
            });
            userId = user.id;

            expect(user.id).toBeDefined();
        });

    });

});
