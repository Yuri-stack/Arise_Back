import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { MagicLoginStrategy } from '../strategy/magiclogin.strategy';
import { PasswordLessLoginDto } from '../entities/passwordless-login.dto';
import { MagicLinkAuthGuard } from '../guard/magic-link-auth.guard';
import { Request, Response } from 'express';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

@ApiTags("Autenticação - Authentication")
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private strategy: MagicLoginStrategy) { }

  @Post('login')
  async login(@Req() req: Request, @Res() res: Response, @Body() body: PasswordLessLoginDto): Promise<void> {
    await this.authService.validateUser(body.destination);
    return this.strategy.send(req, res);
  }

  @ApiExcludeEndpoint()
  @UseGuards(MagicLinkAuthGuard)
  @Get('login/callback')
  callback(@Req() req): object {
    return this.authService.generateTokens(req.user);
  }
}
