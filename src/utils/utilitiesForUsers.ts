import { rankList } from "src/modules/users/constants/user.constants";

export function isValidImage(photo: string): boolean {
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const extension = photo.split('.').pop();
    return allowedExtensions.includes(extension?.toLowerCase());
}

export function calculatePointsForNextLevel(level: number, base: number = 30, factor: number = 1.5): number {
    return Math.round(base * Math.pow(factor, level - 1));
}

export function calculateNewRank(level: number): string | void {
    let newRank: string = "";

    // verifica se o level bate com algum rank (1->Iniciado | 5 -> Novato | ...)
    if (rankList[level] !== undefined)
        return newRank = rankList[level];

    return
}