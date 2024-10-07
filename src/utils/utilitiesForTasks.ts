import { HttpException, HttpStatus } from "@nestjs/common";
import { difficultyMap, validTypes } from "src/modules/tasks/constants/task.constants";
import { TaskDTO } from "src/modules/tasks/entities/task.dto.entity";

export function setLevelOfDifficultToTask(task: TaskDTO): number {
    const difficultUpdated: number = difficultyMap[task.type] || 0;
    return difficultUpdated;
}

export function validateTypeOfTask(taskType: string) {
    if (!validTypes.includes(taskType)) {
        throw new HttpException("Tipo de Tarefa inválido!", HttpStatus.NOT_FOUND);
    }
}

export function setExpirationDate(task: TaskDTO): string {
    // Define a data de criação da tarefa
    task.createdAt = new Date();
    const creationDate: Date = task.createdAt;

    // Mapa para associar tipos de tarefa com a quantidade de dias de expiração
    const expirationDayMap: { [key: string]: number } = {
        "Diária": 365,
        "Semanal": 7,
        "Mensal": 30,
    };

    // Busca a quantidade de dias para expiração com base no tipo da tarefa
    const daysToAdd = expirationDayMap[task.type] || 0;

    // Se não houver expiração, retorna uma string vazia
    if (daysToAdd === 0) {
        return "";
    }

    // Calcula a data de expiração
    const expirationDate: Date = new Date(creationDate);
    expirationDate.setDate(creationDate.getDate() + daysToAdd);

    // Retorna a data de expiração formatada como string ISO
    return expirationDate.toISOString();
}