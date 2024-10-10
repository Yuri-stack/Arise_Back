export const createMessage = (message: string, title?: string) => {
    let defaultTitle: string = "Mensagem do Sistema";

    if (title)
        return { title, message };

    return { defaultTitle, message };
};