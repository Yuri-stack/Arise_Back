import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class PasswordLessLoginDto {

    @ApiProperty({ example: "email@email.com" })
    @IsEmail({}, { message: 'O campo destination precisa ser um email' })
    destination: string;
}