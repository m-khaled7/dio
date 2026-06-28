import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository, UpdateOptions } from "typeorm";
import { WorkflowEntity } from "../entities/workflow.entity.js";
import { GetWorkflowsQueryDto } from "../dto/get-workflow-query.dto.js";

@Injectable()
export class WorkflowRepository {
    constructor(
        @InjectRepository(WorkflowEntity)
        private readonly workflowRepository: Repository<WorkflowEntity>,
    ) {}

    getManager(){
        return this.workflowRepository.manager
    }

    create(data:Partial<WorkflowEntity>){
       return this.workflowRepository.create(data)
    }

    async findOneBy(options:FindOptionsWhere<WorkflowEntity>){
        return await this.workflowRepository.findOneBy(options)
    }

    async getAllWithQuery(userId:string,query:GetWorkflowsQueryDto){
        const qb = this.workflowRepository
            .createQueryBuilder("workflow")
            .where("workflow.userId = :userId", {
                userId,
            });

        // Search
        if (query.search) {
            qb.andWhere(`(workflow.name ILIKE :search OR workflow.description ILIKE :search)`, {
                search: `%${query.search}%`,
            });
        }

        // Filter
        if (query.archived !== undefined) {
            qb.andWhere("workflow.archived = :archived", {
                archived: query.archived === "true",
            });
        }

        // Sort
        qb.orderBy(`workflow.${query.sortBy}`, query.sortOrder);

        // Pagination
        qb.skip((query.page - 1) * query.limit).take(query.limit);

        return await qb.getManyAndCount();
    }

    async updateById(workflowId:string,data:Partial<WorkflowEntity>,updateOptions?:UpdateOptions){
        return await this.workflowRepository.update(workflowId,data,updateOptions)
    }

    async save(workflow:WorkflowEntity){
        return await this.workflowRepository.save(workflow)
    }

    async deleteById(workflowId:string){
        return await this.workflowRepository.delete(workflowId)
    }


}