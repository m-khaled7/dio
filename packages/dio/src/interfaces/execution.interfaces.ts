import { INodeExecutionData } from "./node-type.interfaces.js";
import { INodeData, IWorkflowBase } from "./workflow.interfaces.js";

export type ExecutionMode = "trigger" | "webhook" | "manual";
export type executionStatus = "running" | "success" | "new" | "canceled" | "error" | "crashed";

export interface IWorkflowExecuteData {
    startData?: {
        startNode?: string;
        destinationNode?: string;
    };
    resultData: {
        runData: runData;
        lastNodeExecuted?: string;
        error?: any; //TODO: create error types
    };
    executionData: {
        nodeExecutionStack: IExecuteNodeData[];
        waitingNodes: IWaitingNodes;
    };
}
//node data for run time , null because trigger nodes has no inputs
export interface IExecuteNodeData {
    node: INodeData;
    inputs: TaskExecutionData | null;
    source: SourceNodeData | null;
}

//key->nodeId
export type runData = Record<string, ITaskData>;

export interface ITaskData {
    startedAt: number;
    executionTime: number;
    executionStatus: executionStatus;
    result: TaskExecutionData;
    source: SourceNodeData;
    error?: any; //TODO: create error types
}

//key->nodeId
export type IWaitingNodes = Record<string, IWaitingNodesData>;

export interface IWaitingNodesData {
    source: SourceNodeData;
    inputs: TaskExecutionData;
}

//key->input/output name
export type TaskExecutionData = Record<string, INodeExecutionData | null>;

export type SourceNodeData = Array<ISourceData | null>;

export interface ISourceData {
    previousNodeId: string;
    previousNodeOutputName: string;
}

export interface IWorkflowRunnerData {
    executionMode: ExecutionMode;
    workflowData: IWorkflowBase;
    triggerToStartFrom?: string;
    destinationNode?: string;
    userId?: string;
    executionData?: IWorkflowExecuteData;
}
