import { IWorkflowBase, INodeData, IConnection } from "dio-base";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { WorkflowHistoryEntity } from "./workflow-history.entity.js";

@Entity()
export class WorkflowEntity implements IWorkflowBase {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId:string

    @Column()
    name: string;

    @Column({ type: "text", nullable: true })
    description: string | null;

    @Column({ default: false })
    archived: boolean;

    @Column({
        type: "json",
        default: () => "'[]'",
    })
    nodes: INodeData[];
    @Column({
        type: "json",
        default: () => "'[]'",
    })
    connections: IConnection[];

    @Column()
    versionId: string;

    @Column({ name: "activeVersionId", nullable: true })
    activeVersionId: string | null;

    @OneToOne(() => WorkflowHistoryEntity, { nullable: true })
    @JoinColumn({ name: "activeVersionId" })
    activeVersion: WorkflowHistoryEntity | null;

    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}
