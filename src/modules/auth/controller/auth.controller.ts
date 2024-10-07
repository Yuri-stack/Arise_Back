import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { MagicLoginStrategy } from '../magiclogin.strategy';
import { PasswordLessLoginDto } from '../entities/passwordless-login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private strategy: MagicLoginStrategy) { }

  @Post('login')
  async login(@Req() req, @Res() res, @Body() body: PasswordLessLoginDto) {
    await this.authService.validateUser(body.destination);

    return this.strategy.send(req, res);
  }

  @Get('login/callback')
  callback() {

  }
}
