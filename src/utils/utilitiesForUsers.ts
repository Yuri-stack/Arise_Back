export function isValidImage(photo: string): boolean {
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const extension = photo.split('.').pop();
    return allowedExtensions.includes(extension?.toLowerCase());
}

export function calculatePointsForNextLevel(level: number, base: number = 30, factor: number = 1.5): number {
    return Math.round(base * Math.pow(factor, level - 1));
}