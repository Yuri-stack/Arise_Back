import { HttpException, HttpStatus } from "@nestjs/common";
import { difficultyMap } from "src/constants/task.constants";
import { TaskDTO } from "src/modules/tasks/entities/taskDTO.entity";

export function setLevelOfDifficultToTask(task: TaskDTO) {
    const difficultUpdated: number = difficultyMap[task.type] || 0;
    return difficultUpdated
}

export function validateTypeOfTask(taskType: string) {
    const tiposValidos = ['Diária', 'Semanal', 'Mensal', 'Emergente'];

    if (!tiposValidos.includes(taskType)) {
        throw new HttpException("Tipo de Tarefa inválido!", HttpStatus.NOT_FOUND);
    }
}


