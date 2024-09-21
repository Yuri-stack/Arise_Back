// Exemplo de validação de imagem (substitua com sua lógica)
export function isValidImage(photo: string): boolean {
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const extension = photo.split('.').pop();
    return allowedExtensions.includes(extension?.toLowerCase());
}