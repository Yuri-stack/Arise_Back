import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/users/user.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [PrismaModule, TasksModule, UserModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
