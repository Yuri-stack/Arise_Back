import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';

@Controller()
export class AppController {
    constructor() { }

    @ApiExcludeEndpoint()
    @Get()
    redirect(@Res() response: any) {
        return response.redirect('/swagger');
    }

    @UseGuards(JwtAuthGuard)
    @Get('protected')
    getProtected(@Req() req) {
        return `Player ${req.user.username} conectado`
    }

}
