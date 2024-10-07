import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../users/services/user.service';
import { UserDTO } from 'src/modules/users/entities/userDTO.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) { }

    async validateUser(email: string): Promise<UserDTO> {
        const user = await this.userService.findUserByField('email', email);

        if (!user) throw new UnauthorizedException('Usuário não encontrado ou não autorizado.');

        return user;
    }

    generateTokens(user: UserDTO): object {
        const payload = { sub: user.id, email: user.email };

        return {
            acess_token: this.jwtService.sign(payload)
        }
    }
}
