import { Module } from '@nestjs/common';
import { coreModule } from './core/core.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { WorkflowModule } from './workflow/workflow.module.js';

@Module({
  imports: [coreModule, UsersModule, AuthModule, WorkflowModule]
})
export class AppModule {}
