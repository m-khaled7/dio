import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkflowHistoryEntity } from "../entities/workflow-history.entity.js";

@Injectable()
export class WorkflowHistoryRepository {
    constructor(
        @InjectRepository(WorkflowHistoryEntity)
        private readonly workflowHistoryRepository: Repository<WorkflowHistoryEntity>,
    ) {}
    
    async save(data:WorkflowHistoryEntity){
        return await this.workflowHistoryRepository.save(data)
    }

}