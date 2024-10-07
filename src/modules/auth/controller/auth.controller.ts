import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { MagicLoginStrategy } from '../strategy/magiclogin.strategy';
import { PasswordLessLoginDto } from '../entities/passwordless-login.dto';
import { MagicLinkAuthGuard } from '../guard/magic-link-auth.guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private strategy: MagicLoginStrategy) { }

  @Post('login')
  async login(@Req() req: Request, @Res() res: Response, @Body() body: PasswordLessLoginDto) {
    await this.authService.validateUser(body.destination);

    return this.strategy.send(req, res);
  }

  @UseGuards(MagicLinkAuthGuard)
  @Get('login/callback')
  callback(@Req() req) {
    return this.authService.generateTokens(req.user);
  }
}
