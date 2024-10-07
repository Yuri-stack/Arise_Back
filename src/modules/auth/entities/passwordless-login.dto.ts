import { IsEmail } from "class-validator";

export class PasswordLessLoginDto {
    @IsEmail({}, { message: "O campo destination precisa ser um email" })
    destination: string;
}