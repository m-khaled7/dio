import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Index({ unique: true })
    email: string;

    @Column({ length: 32 })
    firstName: string;

    @Column({ length: 32 })
    lastName: string;

    @Column()
    password: string;

    @Column({
        type: "text",
        nullable: true,
    })
    refreshToken: string|null;

    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}
