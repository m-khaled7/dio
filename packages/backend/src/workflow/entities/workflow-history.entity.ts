import { INodeData, IConnection } from "dio-base";
import { Entity, PrimaryColumn, Column, ManyToOne,type Relation } from "typeorm";
import { WorkflowEntity } from "./workflow.entity.js";

@Entity()
export class WorkflowHistoryEntity {
    @PrimaryColumn()
    versionId: string;

    @Column({ nullable: true })
    workflowId: string;

    @Column({ type: "json" })
    nodes: INodeData[];
    @Column({ type: "json" })
    connections: IConnection[];

    @ManyToOne(() => WorkflowEntity, { nullable: true,onDelete:"CASCADE" })
    workflow: Relation<WorkflowEntity>;
}
