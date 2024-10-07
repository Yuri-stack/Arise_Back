export enum TaskType {
    DIARIA = 'Diária',
    SEMANAL = 'Semanal',
    MENSAL = 'Mensal',
    EMERGENTE = 'Emergente',
};

export const difficultyMap: Record<TaskType, number> = {
    [TaskType.DIARIA]: 5,
    [TaskType.SEMANAL]: 10,
    [TaskType.MENSAL]: 20,
    [TaskType.EMERGENTE]: 40,
};

export const validTypes = ['Diária', 'Semanal', 'Mensal', 'Emergente'];