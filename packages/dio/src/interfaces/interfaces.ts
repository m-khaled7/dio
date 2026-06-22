import { NodeType } from "./node-type.interfaces.js";

export type GenericValue = string | number | boolean | object | null | undefined;

export interface IDataObject {
    [key: string]: GenericValue | IDataObject | GenericValue[] | IDataObject[];
}
export type NodeParamValue = string | boolean | number | null | undefined;

export interface NodeQuerent {
    getNodeByIdAndVersion(name: string, version?: number): NodeType;
    getNodeById(name: string): NodeType;
}

export interface IWebhookData {
    path: string;
    nodeId: string;
    workflowId: string;
}
