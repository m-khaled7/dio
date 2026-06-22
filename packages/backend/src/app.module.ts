import { Module } from '@nestjs/common';
import { coreModule } from './core/core.module.js';

@Module({
  imports: [coreModule]
})
export class AppModule {}
