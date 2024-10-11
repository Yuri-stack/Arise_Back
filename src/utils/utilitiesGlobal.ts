export const createMessage = (text: string, header?: string) => {
    let title: string = "Mensagem do Sistema";

    if (header) {
        title = header;
        return { title, text };
    }

    return { title, text };
};