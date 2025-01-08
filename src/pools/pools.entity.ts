import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Pools{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    address: string;

    @Column()
    phone: string;

    @Column()
    website: string;

    
}