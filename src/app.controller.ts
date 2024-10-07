import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';
import { Response } from 'express';

@ApiTags("Autenticação - Authentication")
@Controller()
export class AppController {
    constructor() { }

    @ApiExcludeEndpoint()
    @Get()
    redirect(@Res() response: Response) {
        return response.redirect('/swagger');
    }

    @UseGuards(JwtAuthGuard)
    @Get('welcome')
    getProtected(@Req() request) {
        return `Player ${request.user.username} conectado`
    }

}
