import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Images {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column({name : "file_name"})
    filename: string;

    @Column({name : "file_size"})
    size: number;

    @Column({name : "mime_type"})
    mimetype: string;

    @CreateDateColumn()
    uploaded_at: Date;
}