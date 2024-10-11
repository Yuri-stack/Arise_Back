import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../users/services/user.service';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) { }

    async validateUser(email: string): Promise<UserEntity> {
        const user = await this.userService.findUserByField('email', email);
        if (!user) throw new UnauthorizedException('Usuário não encontrado ou não autorizado.');
        return user;
    }

    generateTokens(user: UserEntity): object {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
