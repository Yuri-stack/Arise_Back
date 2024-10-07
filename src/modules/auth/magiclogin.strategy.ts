import { Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import Strategy from 'passport-magic-login';
import { AuthService } from "./services/auth.service";

export class MagicLoginStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(MagicLoginStrategy.name);

    constructor(private authService: AuthService) {
        super({
            secret: 'your-secret',
            jwtOptions: {
                expiresIn: '5m'
            },
            callback: 'http://localhost:3000/auth/login/callback',
            sendMagicLink: async (destination, href) => {
                // logica para enviar o email
                this.logger.debug(`sending email to ${destination} with Link ${href}`);
            },
            verify: async (payload, callback) =>
                callback(null, this.validate(payload)),
        });
    }

    validate(payload: { destination: string }) {
        const user = this.authService.validateUser(payload.destination);
        return user;
    }
}