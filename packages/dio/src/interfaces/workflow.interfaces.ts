import { NodeParamValue } from "./interfaces.js";

export interface IWorkflowBase {
    id: string;
    name: string;
    description?: string | null;
    archived: boolean;
    createdAt: Date;
    startedAt?: Date;
    updatedAt: Date;
    nodes: INodeData[];
    connections: IConnection[];
    versionId?: string;
    activeVersionId: string | null;
}

//region Node Data

//Stored Node data in db and used in workflow execution
export interface INodeData {
    id: string;
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    parameters: INodeDataParameters;
    credentials?: Record<string, INodeDataCredentials>;
    disabled?: boolean;
    notes?: string;
}

export interface INodeDataParameters {
    [key: string]: NodeDataParametersValueTypes;
}

export type NodeDataParametersValueTypes =
    | NodeParamValue
    | NodeParamValue[]
    | INodeDataParameters
    | INodeDataParameters[];

export interface INodeDataCredentials {
    id: string;
    name: string;
}

//endregion

//#region Connections

//type of the connection, for now we only have 'main' but in the future we might have other types for AI Agents or other special nodes
export const NodeConnectionTypes = {
    Main: "main",
} as const;

export type NodeConnectionType = (typeof NodeConnectionTypes)[keyof typeof NodeConnectionTypes];

export interface IConnection {
    sourceNodeId: string;
    sourcePort: string;
    targetNodeId: string;
    targetPort: string;
    type: NodeConnectionType;
}
//endregion
