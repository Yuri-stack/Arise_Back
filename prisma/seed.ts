import { PrismaClient } from "@prisma/client";
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();
let fakeUsers = [], fakeTasks = [];

async function createAdminUser() {
    const adminUser = {
        id: faker.string.uuid(),
        username: "Monarca de Jade",
        email: "monarca@email.com",
        role: "admin",
        rank: "Monarca",
        level: 100,
        photo: faker.image.urlLoremFlickr(),
        progress: 0,
        reachToNextLevel: 0,
    }

    await prisma.user.create({ data: { ...adminUser } })
}

async function createFakeUsers() {
    const users = [];

    while (users.length < 5) {
        users.push({
            id: faker.string.uuid(),
            username: faker.internet.userName(),
            email: faker.internet.email().toLocaleLowerCase(),
            role: "Player",
            rank: "Iniciante",
            level: 1,
            photo: faker.image.urlLoremFlickr(),
            progress: 0,
            reachToNextLevel: 30,
        })
    }

    const usersPromise = users.map(user => prisma.user.create({ data: { ...user } }));
    fakeUsers = await Promise.all(usersPromise);
}

async function createFakeTasks() {
    const tasks = [];

    for (let i = 0; tasks.length < 5; i++) {
        const currentDate = new Date();
        const expirationDate = new Date();
        expirationDate.setDate(currentDate.getDate() + 7);

        tasks.push({
            id: faker.string.uuid(),
            name: `Tarefa Número: ${i}`,
            description: faker.lorem.words({ min: 1, max: 10 }),
            difficult: faker.helpers.arrayElement([5, 10, 20, 40]),
            status: "Pendente",
            type: "Semanal",
            createdAt: currentDate,
            expirationAt: expirationDate.toISOString(),
            userId: fakeUsers[i].id
        })
    }

    const tasksPromise = tasks.map(task => prisma.tasks.create({ data: { ...task } }));
    fakeTasks = await Promise.all(tasksPromise);
}

async function updateFakeUsers() {
    for (let i = 0; i < fakeUsers.length; i++) {
        fakeUsers[i] = { ...fakeUsers[i], tasks: fakeTasks[i].id };
    }

    const fakeUsersUpdated = fakeUsers.map(user =>
        prisma.user.update({
            where: { id: user.id },
            data: { tasks: { connect: { id: user.tasks } } }
        })
    );
    await Promise.all(fakeUsersUpdated);
}

async function createSeed() {
    try {
        await createAdminUser();
        await createFakeUsers();
        await createFakeTasks();
        await updateFakeUsers();
    } catch (error) {
        console.log(error)
        console.error("Erro ao gerar a Seed")
    }
}

createSeed();