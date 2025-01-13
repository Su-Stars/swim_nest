import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
@Index("FT_search", ['name', 'address'], {fulltext: true})
export class Pools{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
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

    @Column({nullable: true})
    depth_info: string;

    @Column({nullable: true})
    is_Soap_Provided: boolean;
    
    @Column({nullable: true})
    is_Towel_Provided: boolean;
    
    @Column({nullable: true})
    is_Kickboard_Allowed: boolean;
    
    @Column({nullable: true})
    is_Fins_Allowed: boolean;
    
    @Column({nullable: true})
    is_Kickboard_Rental: boolean;
    
    @Column({nullable: true})
    is_Diving_Allowed: boolean;

    @Column({nullable: true})
    is_Photo_Allowed: boolean;

    @Column('text', {nullable: true})
    description: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}