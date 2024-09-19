import { Module } from '@nestjs/common';
import { TasksModule } from './modules/tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/tasks/user.module';

@Module({
  imports: [PrismaModule, TasksModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
