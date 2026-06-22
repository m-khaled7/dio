import { GenericValue, IDataObject, NodeParamValue } from "./interfaces.js";
import { NodeConnectionType } from "./workflow.interfaces.js";
export type NodePropertyType = "string" | "number" | "boolean" | "options";

//TODO:add nodeApi type when finished
export abstract class NodeType {
    abstract description: INodeDescription;
    execute?: (nodeApi: any) => Promise<NodeExecutionData>;
    trigger?: (nodeApi: any) => Promise<NodeExecutionData>;
    poll?: (nodeApi: any) => Promise<NodeExecutionData>;
    webhook?: (nodeApi: any) => Promise<NodeExecutionData>;
}

export interface INodeDescription {
    displayName: string;
    name: string;
    description?: string;
    iconUrl?: string;
    inputs: INodeInputs[];
    outputs: INodeOutputs[];
    properties: INodeProperties[];
}

export interface INodeInputs {
    displayName: string;
    name: string;
    type: NodeConnectionType;
    required: boolean;
}

export type INodeOutputs = Omit<INodeInputs, "required">;


// for dynamic ui building, used to define node parameters
export interface INodeProperties {
    displayName: string;
    name: string;
    type: NodePropertyType;
    required?: boolean;
    description?: string;
    default?: GenericValue;
    options?: INodeProperties[];
    displayOptions?: IDisplayOptions;
}

//when should and property should apper or hides based on the value of other property,
export interface IDisplayOptions {
    //property name: array of property values for which the property should be hidden or shown
    hide?: { [key: string]: Array<NodeParamValue> };
    show?: { [key: string]: Array<NodeParamValue> };
}

//node input/output data | key => input/output name
export type NodeExecutionData = Record<string, INodeExecutionData>;

export interface INodeExecutionData {
    [key: string]: IDataObject | number | string | undefined;
    json: IDataObject;
    error?: IDataObject | string;
}
