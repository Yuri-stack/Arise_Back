import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controller/auth.controller';
import { UserModule } from '../users/user.module';
import { MagicLoginStrategy } from './magiclogin.strategy';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, MagicLoginStrategy],
})
export class AuthModule { }
