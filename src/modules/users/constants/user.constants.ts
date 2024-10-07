import { UserDto } from "../entities/user.dto.entity";

export type UserSearchFields = keyof Pick<UserDto, "id" | "username" | "email">;

export const allowedFieldsForSearching: UserSearchFields[] = ["id", "username", "email"];