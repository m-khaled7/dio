import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateWorkflowDto } from './dto/create-workflow.dto.js';
import { UpdateWorkflowDto } from './dto/update-workflow.dto.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { WorkflowService } from './workflow.service.js';
import { GetWorkflowsQueryDto } from './dto/get-workflow-query.dto.js';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/auth.guards.js';

@ApiTags("workflows")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workflow")
export class WorkflowController {
    constructor(private readonly workflowService: WorkflowService) {}

    @Post()
    async create(@Body() createWorkflowDto: CreateWorkflowDto, @GetUser("id") userId: string) {
        return await this.workflowService.create(createWorkflowDto, userId);
    }

    @Get()
    async getAll(@Query() query: GetWorkflowsQueryDto, @GetUser("id") userId: string) {
        return await this.workflowService.getAll(userId, query);
    }

    @Get("/:workflowId")
    async getWorkflow(
        @Param("workflowId", new ParseUUIDPipe()) workflowId: string,
        @GetUser("id") userId: string
    ) {
        return await this.workflowService.getWorkflow(workflowId, userId);
    }

    @Patch("/:workflowId")
    async update(
        @Param("workflowId", new ParseUUIDPipe()) workflowId: string,
        @Body() updateWorkflowDto: UpdateWorkflowDto,
        @GetUser("id") userId: string
    ) {
        return await this.workflowService.update(workflowId, updateWorkflowDto, userId);
    }

    @Delete("/:workflowId")
    async delete(
        @Param("workflowId", new ParseUUIDPipe()) workflowId: string,
        @GetUser("id") userId: string
    ) {
        return await this.workflowService.delete(workflowId, userId);
    }
}
