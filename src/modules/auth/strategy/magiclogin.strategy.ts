import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import Strategy from 'passport-magic-login';
import { AuthService } from "../services/auth.service";
import { UserService } from "src/modules/users/services/user.service";

@Injectable()
export class MagicLoginStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(MagicLoginStrategy.name);

    constructor(private authService: AuthService, private userService: UserService) {
        super({
            secret: process.env.MAGIC_LOGIN_STRATEGY_SECRET,
            jwtOptions: {
                expiresIn: '5m',
            },
            callbackUrl: 'http://localhost:3000/auth/login/callback',
            sendMagicLink: async (destination: string, href: string) => {
                // Apenas para ver o link no Console
                this.logger.debug(`Enviando email para ${destination} com o Link de Acesso: ${href}`);
                // Recurso para enviar E-mail
                userService.sendLoginLink(destination, href);
            },
            verify: async (payload: { destination: string; }, callback: Function) =>
                callback(null, this.validate(payload)),
        });
    }

    validate(payload: { destination: string }) {
        const user = this.authService.validateUser(payload.destination);
        return user;
    }
}