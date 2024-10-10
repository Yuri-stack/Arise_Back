import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector, private jwtService: JwtService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const canActivate = await super.canActivate(context);

        if (!canActivate) return false;

        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        const token = request.headers.authorization?.split(' ')[1];

        if (!token)
            throw new UnauthorizedException('No token provided');

        const payload = this.jwtService.verify(token, { secret: process.env.JWT_CONSTANT });
        const userRoles: string[] = Array.isArray(payload.role) ? payload.role : [payload.role];

        const hasRole = () =>
            userRoles.some((role) => requiredRoles.includes(role));

        if (!hasRole()) {
            throw new UnauthorizedException('Insufficient permissions');
        }

        return true;
    }
}
