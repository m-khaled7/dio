import {
    IExecuteNodeData,
    IWaitingNodes,
    IWorkflowExecuteData,
    runData,
} from "../interfaces/index.js";

export interface createcreateWorkflowExcuteDataOptions {
    startData?: {
        startNode?: string;
        destination?: string;
    };
    resultData?: {
        runData?: runData;
        error?: any;
        lastNodeExecuted?: string;
    };
    executionData?: {
        nodeExecutionStack?: IExecuteNodeData[];
        waitingNodes?: IWaitingNodes;
    };
}

export function createWorkflowExecuteData(
    options: createcreateWorkflowExcuteDataOptions = {}
): IWorkflowExecuteData {
    return {
        startData: options.startData,
        resultData: buildResultData(options.resultData),
        executionData: buildExecutionData(options.executionData),
    };
}

function buildResultData(
    resultData: createcreateWorkflowExcuteDataOptions["resultData"]
): IWorkflowExecuteData["resultData"] {
    return {
        error: resultData?.error,
        runData: resultData?.runData ?? {},
        lastNodeExecuted: resultData?.lastNodeExecuted,
    };
}

function buildExecutionData(
    executionData: createcreateWorkflowExcuteDataOptions["executionData"]
): IWorkflowExecuteData["executionData"] {
    return {
        nodeExecutionStack: executionData?.nodeExecutionStack ?? [],
        waitingNodes: executionData?.waitingNodes ?? {},
    };
}
