
import { PrismaService } from "../../../prisma/prisma.service";
import { UserService } from "../services/user.service"
import { Test, TestingModule } from "@nestjs/testing";
import { MailerService } from "@nestjs-modules/mailer";
import { execSync } from "child_process";
import { HttpException, HttpStatus } from "@nestjs/common";

describe('Suíte de Testes do UserService', () => {
    let service: UserService;
    let prisma: PrismaService;

    const dateMock = new Date();

    const usersMock = [
        {
            id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5f9",
            username: "ada_lovelace",
            email: "ada_lovelace@email.com",
            photo: "",
            rank: "Iniciante",
            progress: 0
        },
        {
            id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5f9",
            username: "ada_lovelace",
            email: "ada_lovelace@email.com",
            photo: "",
            rank: "Iniciante"
        },
        {
            id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5f9",
            username: "ada_lovelace",
            email: "ada_lovelace2@email.com",
            photo: "",
            rank: "Iniciante"
        },
        {
            id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5f8",
            username: "adaLovelace",
            email: "adaLovelace@email.com",
            photo: "imagem.webp",
            rank: "Iniciante"
        },
        {
            id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5f0",
            username: "alanTuring",
            email: "alanTuring@email.com",
            photo: "",
            rank: "Iniciante"
        },
        {
            id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5f9",
            username: "ada_lovelace2",
            email: "ada_lovelace2@email.com",
            photo: "",
            rank: "Iniciante",
            progress: 0
        },
    ]

    const taskMock = [
        {
            id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5f7",
            name: "Teste de Tarefa Completa",
            description: "Feito apenas para Testar Métodos Específicos",
            difficult: 20,
            status: "Completa",
            type: "Mensal",
            createdAt: dateMock,
            user: { ...usersMock[0] }
        },
        {
            id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5f7",
            name: "Teste de Tarefa Incompleta",
            description: "Feito apenas para Testar Métodos Específicos",
            difficult: 20,
            status: "Pendente",
            type: "Mensal",
            createdAt: dateMock,
            user: { ...usersMock[0] }
        },

    ]

    const mailerServiceMock = {
        sendMail: jest.fn().mockResolvedValue({ success: true }), // Mock para o método sendMail
    };

    beforeAll(async () => {
        // Gera o Prisma Client com base nas configurações de SQLite
        execSync('npx prisma generate --schema=./prisma/schema.sqlite.prisma');

        // Rodar o Prisma DB Push para sincronizar o banco de dados com o schema
        execSync('npx prisma db push --schema=./prisma/schema.sqlite.prisma');
    })

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService, PrismaService,
                { provide: MailerService, useValue: mailerServiceMock },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
    })

    describe("Tests for user's creation", () => {
        it("01 - Should create a new user", async () => {
            const prismaSpy = jest.spyOn(prisma.user, 'create');

            const user = await service.create(usersMock[0]);
            expect(user.email).toBe(usersMock[0].email);
            expect(user.id).toBeDefined();

            expect(prismaSpy).toHaveBeenCalledTimes(1);
            expect(prismaSpy).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    email: usersMock[0].email,
                }),
            });

            // const userCreated = await prisma.user.findFirst({ where: { email: userMock.email } });
            // expect(userCreated).not.toBeNull(); // Certifica que o usuário foi criado
            // expect(userCreated.email).toBe(userMock.email); // Verifica o email no banco
        });

        it("02 - Shouldn't create a user with same email", async () => {
            expect(service.create(usersMock[1]))
                .rejects.toThrow(new HttpException("Email já cadastrado!", HttpStatus.BAD_REQUEST));
        });

        it("03 - Shouldn't create a user with same username", async () => {
            expect(service.create(usersMock[2]))
                .rejects.toThrow(new HttpException('Seu nome de Player já foi cadastrado!', HttpStatus.BAD_REQUEST));
        });

        it("04 - Shouldn't create a user with invalid format image", async () => {
            expect(service.create(usersMock[3]))
                .rejects
                .toThrow(new HttpException(
                    "Sua imagem é inválida! Por favor, insira um dos seguintes formatos: 'jpg', 'jpeg', 'png'",
                    HttpStatus.BAD_REQUEST));
        });
    });

    describe("Tests for user's searching", () => {
        it("01 - Should find all users", async () => {
            await service.create(usersMock[4]);
            expect(service.findAll()).resolves.toBeDefined();
        });

        it("02 - Should find user by id", async () => {
            expect(service.findUserByField('id', usersMock[0].id)).resolves.toBeDefined();
        });

        it("03 - Should find user by username", async () => {
            expect(service.findUserByField('username', usersMock[0].username)).resolves.toBeDefined();
        });

        it("04 - Should find user by email", async () => {
            expect(service.findUserByField('email', usersMock[0].email)).resolves.toBeDefined();
        });

        it("05 - Shouldn't find user with invalid email", async () => {
            expect(service.findUserByField('email', "usuario@email.com")).resolves.toBe(null);
        });
    });

    describe("Tests for user's updating", () => {
        it("01 - Should allow update email, username and photo user's", async () => {
            const userUpdated = await service.update({
                ...usersMock[1],
                email: "adalove@email.com",
                username: "adaLove",
                photo: "image.png",
            });
            expect(userUpdated.email).toBe("adalove@email.com");
            expect(userUpdated.username).toBe("adaLove");
            expect(userUpdated.photo).toBe("image.png");
        });

        it("02 - Should allow partial update", async () => {
            const userUpdated = await service.update({
                ...usersMock[1],
                username: "adaLove_",
                photo: "image.png",
            });
            expect(userUpdated.username).toBe("adaLove_");
            expect(userUpdated.photo).toBe("image.png");
        });

        it("03 - Shouldn't allow update automatic fields user's", async () => {
            const userUpdated = await service.update({
                ...usersMock[2],
                rank: "Monarca",
                level: 10,
                progress: 500,
                reachToNextLevel: 5000,
                role: "Admin"
            });
            expect(userUpdated.rank).toBe("Iniciante");
            expect(userUpdated.progress).toBe(0);
            expect(userUpdated.reachToNextLevel).toBe(0);
        });

        it("04 - Shouldn't allow update user with invalid id", async () => {
            expect(service.update({
                ...usersMock[3],
                photo: "image.png",
            })).rejects.toThrow(`Usuário não encontrado!`);
        });

        it("05 - Shouldn't update a user with duplicated username", () => {
            expect(service.update(usersMock[1]))
                .rejects.toThrow(new HttpException("Seu nome de Player já foi cadastrado!", HttpStatus.BAD_REQUEST));
        });

        it("06 - Shouldn't update a user with duplicated email", async () => {
            expect(service.update(usersMock[5]))
                .rejects.toThrow(new HttpException("Email já cadastrado!", HttpStatus.BAD_REQUEST));
        });
    });

    describe("Tests for user's deletion", () => {
        it("01 - Should delete a user by id", async () => {
            await service.delete(usersMock[4].id);

            const deletedUser = await service.findUserByField('id', usersMock[4].id);
            expect(deletedUser).toBeNull();
        });

        it("02 - Shouldn't delete a user if id wasn't find", async () => {
            expect(service.delete("123456"))
                .rejects
                .toThrow(`Usuário não existe!`);
        });
    });

    describe("Tests for update user's progress", () => {
        it("Should update the user's progress", async () => {
            await service.getExperienceAndUpdateProgress(taskMock[0]);

            const userUpdated = await service.findUserByField("id", usersMock[0].id);

            expect(userUpdated.progress).toBe(usersMock[0].progress + taskMock[0].difficult);
        });

        it("Shouldn't update the user's progress if the task wasn't finished", async () => {
            expect(service.getExperienceAndUpdateProgress(taskMock[1]))
                .rejects
                .toThrow(new HttpException("Tarefa não concluída", HttpStatus.BAD_REQUEST));
        })
    });

    describe("Tests for check user's progress", () => {
        it("Should level up the user when progress less or equal than reachToNextLevel", async () => {
            const userMock = {
                id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5g9",
                username: "nextage",
                email: "nextage@email.com",
                photo: "imagem.png",
                progress: 100,
                reachToNextLevel: 80,
                level: 1,
                rank: 'Iniciado'
            };

            await service.create(userMock);

            const result = await service.checkProgressToLevelUp(userMock.id);

            const updatedUser = await prisma.user.findUnique({ where: { id: userMock.id } });
            expect(updatedUser.level).toBe(userMock.level + 1);
            expect(updatedUser.progress).toBe(userMock.progress - userMock.reachToNextLevel);

            expect(result).toEqual({ username: userMock.username, level: updatedUser.level });
        });

        it("Shouldn't level up the user when progress less than reachToNextLevel", async () => {
            const userMock = {
                id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5y9",
                username: "nextagelace",
                email: "nextagelace@email.com",
                photo: "imagem.png",
                progress: 50,
                reachToNextLevel: 80,
                level: 1,
                rank: 'Iniciado'
            };

            await service.create(userMock);

            const result = await service.checkProgressToLevelUp(userMock.id);

            const updatedUser = await prisma.user.findUnique({ where: { id: userMock.id } });
            expect(updatedUser.level).toBe(userMock.level);
            expect(updatedUser.progress).toBe(userMock.progress);
            expect(updatedUser.reachToNextLevel).toBe(userMock.reachToNextLevel);

            expect(result).toBeUndefined();
        });

        it("Shouldn't update the user's rank when the new level not match with anyone new rank", async () => {
            const userMock = {
                id: "0a18d0d0-c4a2-4521-8db0-ba8b8100e5i9",
                username: "nextagelace2",
                email: "nextagelace2@email.com",
                photo: "imagem.png",
                progress: 90,
                reachToNextLevel: 80,
                level: 2,
                rank: 'Iniciado'
            };

            await service.create(userMock);

            await service.checkProgressToLevelUp(userMock.id);
            const updatedUser = await prisma.user.findUnique({ where: { id: userMock.id } });
            expect(updatedUser.level).toBe(userMock.level + 1);

            expect(updatedUser.rank).toEqual(userMock.rank);
        });

    });

    describe("Test email send", () => {
        it("Should send email correctly", () => {
            expect(service.sendLoginLink("user@email.com", "http://test.com")).resolves;
        });
    });
});

