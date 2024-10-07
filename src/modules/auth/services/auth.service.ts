import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../users/services/user.service';

@Injectable()
export class AuthService {
    constructor(private userService: UserService) { }

    async validateUser(email: string) {
        const user = await this.userService.findUserByField('email', email);

        if (!user) throw new UnauthorizedException('Usuário não encontrado ou não autorizado.');

        return user;
    }
}
