import { Module } from '@nestjs/common';
import { coreModule } from './core/core.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [coreModule, UsersModule, AuthModule]
})
export class AppModule {}
