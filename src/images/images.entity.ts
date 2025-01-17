import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Images {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column()
    file_name: string;

    @Column()
    file_size: number;

    @Column()
    mime_type: string;

    @CreateDateColumn()
    created_at: Date;
}