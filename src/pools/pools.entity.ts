import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Pools{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    @Index("region_search", {fulltext: true})
    address: string;

    @Column({nullable: true})
    phone: string;

    @Column({nullable: true})
    website: string;

    @Column("decimal", {precision: 10, scale: 8, nullable: true})
    latitude: number;
    
    @Column("decimal", {precision: 11, scale: 8, nullable: true})
    longtitude: number;

    @Column({nullable: true})
    free_swim_link: string;

    @Column({nullable: true})
    swim_lesson_link: string;

    @Column({nullable: true})
    lane_info: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}