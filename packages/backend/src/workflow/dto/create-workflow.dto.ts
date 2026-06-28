import { IsString, IsOptional, IsArray } from "class-validator";
import { IConnection, INodeData } from "dio-base";
import { NoXss } from "../../common/decorators/no-xss.decorator.js";
import { ApiProperty } from "@nestjs/swagger";

export class CreateWorkflowDto {
    @ApiProperty()
    @IsString()
    @NoXss()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @NoXss()
    description?: string

    @ApiProperty()
    @IsArray()
    nodes: INodeData[];

    @ApiProperty()
    @IsArray()
    connections: IConnection[];
}
