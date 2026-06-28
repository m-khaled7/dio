import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { CreateWorkflowDto } from "./dto/create-workflow.dto.js";
import { WorkflowRepository } from "./repositories/workflow.repository.js";
import { DAG, DagError, IConnection, INodeData } from "dio-base";
import { Logger } from "../core/logger/logger.service.js";
import { v4 as uuid } from "uuid";
import { WorkflowEntity } from "./entities/workflow.entity.js";
import { WorkflowHistoryEntity } from "./entities/workflow-history.entity.js";
import { isDeepStrictEqual } from "util";
import { UpdateWorkflowDto } from "./dto/update-workflow.dto.js";
import { WorkflowHistoryRepository } from "./repositories/workflow-history.repository.js";
import { GetWorkflowsQueryDto } from "./dto/get-workflow-query.dto.js";

@Injectable()
export class WorkflowService {
    constructor(
        private readonly workflowRepository: WorkflowRepository,
        private readonly workflowHistoryRepository: WorkflowHistoryRepository,
        private readonly logger: Logger
    ) {}

    async create(dto: CreateWorkflowDto, userId: string) {
        this.validateDag(dto.nodes!, dto.connections!, userId);
        const savedWorkflow = await this.workflowRepository
            .getManager()
            .transaction(async (transactionManager) => {
                const workflowEntity = this.workflowRepository.create({
                    ...dto,
                    userId,
                    versionId: uuid(),
                });
                const newWorkflow = await transactionManager.save<WorkflowEntity>(workflowEntity);
                const { id, versionId, nodes, connections } = newWorkflow;
                await transactionManager.getRepository(WorkflowHistoryEntity).save({
                    workflowId: id,
                    versionId,
                    nodes,
                    connections,
                });
                return newWorkflow;
            });

        if (!savedWorkflow) {
            this.logger.error("Failed to create workflow.", { userId });
            throw new InternalServerErrorException("Failed to save workflow.");
        }
        return savedWorkflow;
    }

    async getWorkflow(id: string, userId: string) {
        const workflow = await this.workflowRepository.findOneBy({ id, userId });
        if (!workflow) throw new NotFoundException("Workflow not found.");
        return workflow;
    }

    async getAll(userId: string, query: GetWorkflowsQueryDto) {
        const [data, total] = await this.workflowRepository.getAllWithQuery(userId, query);
        return {
            data,
            meta: {
                total,
                page: query.page,
                limit: query.limit,
                pages: Math.ceil(total / query.limit),
            },
        };
    }

    async update(workflowId: string, dto: UpdateWorkflowDto, userId: string) {
        const workflow = await this.workflowRepository.findOneBy({ id: workflowId, userId });
        if (!workflow) throw new NotFoundException("Workflow not found.");

        //check if nodes will be updated to save new version in worflow history
        const saveNewVersion = this.shouldSaveNewVersion(dto, workflow);

        //is now save after dto validation
        const updateWorkflow = this.workflowRepository.create({...dto})

        if (saveNewVersion) {
            this.validateDag(dto.nodes!, dto.connections!, userId);
            updateWorkflow.versionId = uuid();
            updateWorkflow.nodes = dto.nodes!;
            updateWorkflow.connections = dto.connections!;
        }

        await this.workflowRepository.updateById(workflowId, updateWorkflow);

        if (saveNewVersion) {
            const { nodes, connections, versionId } = updateWorkflow;
            await this.workflowHistoryRepository.save({
                workflowId,
                nodes,
                connections,
                versionId,
            } as WorkflowHistoryEntity);
        }

        //return the updated workflow because update method don't return the workflow
        return await this.workflowRepository.findOneBy({ id: workflowId });
    }

    async delete(id: string, userId: string) {
        const workflow = await this.workflowRepository.findOneBy({ id, userId });
        if (!workflow) throw new NotFoundException("Workflow not found.");
        if (!workflow.archived)
            throw new BadRequestException("Workflow must be archived before it can be deleted.");
        await this.workflowRepository.deleteById(id);
        return workflow;
    }

    private validateDag(nodes: INodeData[], connections: IConnection[], userId: string) {
        try {
            new DAG().load(nodes, connections);
        } catch (e) {
            if (e instanceof DagError) throw new BadRequestException(e.message);
            this.logger.error("failed to create workflow", { userId }, e);
            throw new InternalServerErrorException("failed to save workflow");
        }
    }

    private shouldSaveNewVersion(dto: UpdateWorkflowDto, workflow: WorkflowEntity): boolean {
        const hasNodes = Object.prototype.hasOwnProperty.call(dto, "nodes");
        const hasConnections = Object.prototype.hasOwnProperty.call(dto, "connections");
        const nodesChanged = hasNodes && !isDeepStrictEqual(dto.nodes, workflow.nodes);
        const connectionsChanged =
            hasConnections && !isDeepStrictEqual(dto.connections, workflow.connections);
        return nodesChanged || connectionsChanged;
    }
}
