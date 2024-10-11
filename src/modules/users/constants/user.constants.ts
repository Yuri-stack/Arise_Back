import { UserEntity } from "../entities/user.entity";

export type UserSearchFields = keyof Pick<UserEntity, "id" | "username" | "email">;

export const allowedFieldsForSearching: UserSearchFields[] = ["id", "username", "email"];

export const rankList = {
    2: "Iniciado",
    5: "Aspirante",
    10: "Novato",
    15: "Intermediário",
    25: "Avançado",
    35: "Veterano",
    50: "Expert",
    75: "Despertado",
    100: "Monarca"
};