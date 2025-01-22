import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Bookmarks } from "../bookmarks/bookmarks.entity";

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

    @Column({nullable: true, name: "free_swim_link"})
    freeSwimLink: string;

    @Column({nullable: true, name: "swim_lesson_link"})
    swimLessonLink: string;

    @Column({nullable: true, name: "lane_info"})
    laneInfo: string;

    @Column({nullable: true, name: "depth_info"})
    depthInfo: string;

    @Column({nullable: true, name: "is_soap_provided"})
    isSoapProvided: boolean;
<<<<<<< HEAD
    
    @Column({nullable: true, name: "is_towel_provided"})
    isTowelProvided: boolean;
    
    @Column({nullable: true, name: "is_kickboard_allowed"})
    isKickboardAllowed: boolean;
    
    @Column({nullable: true, name: "is_fins_allowed"})
    isFinsAllowed: boolean;
    
    @Column({nullable: true, name: "is_kickboard_rental"})
    isKickboardRental: boolean;
    
    @Column({nullable: true, name: "is_diving_allowed"})
    isDivingAllowed: boolean;

=======

    @Column({nullable: true, name: "is_towel_provided"})
    isTowelProvided: boolean;

    @Column({nullable: true, name: "is_kickboard_allowed"})
    isKickboardAllowed: boolean;

    @Column({nullable: true, name: "is_fins_allowed"})
    isFinsAllowed: boolean;

    @Column({nullable: true, name: "is_kickboard_rental"})
    isKickboardRental: boolean;

    @Column({nullable: true, name: "is_diving_allowed"})
    isDivingAllowed: boolean;

>>>>>>> 6941a9ef81d9b4a24f64fbff8539dadf67e5cbda
    @Column({nullable: true, name: "is_photo_allowed"})
    isPhotoAllowed: boolean;

    @Column('text', {nullable: true})
    description: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Pools 를 참조하는 테이블을 위한 릴레이션
    @OneToMany(() => Bookmarks, (bookmark) => bookmark.pools)
    bookmarks : Bookmarks[];
}