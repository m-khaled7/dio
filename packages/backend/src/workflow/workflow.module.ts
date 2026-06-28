import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service.js';
import { WorkflowController } from './workflow.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowEntity } from './entities/workflow.entity.js';
import { WorkflowHistoryEntity } from './entities/workflow-history.entity.js';
import { WorkflowRepository } from './repositories/workflow.repository.js';
import { WorkflowHistoryRepository } from './repositories/workflow-history.repository.js';

@Module({imports:[TypeOrmModule.forFeature([WorkflowEntity,WorkflowHistoryEntity])],
  providers: [WorkflowService,WorkflowRepository,WorkflowHistoryRepository],
  controllers: [WorkflowController]
})
export class WorkflowModule {}
