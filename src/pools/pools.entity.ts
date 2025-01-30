import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany, OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Bookmarks } from "../bookmarks/bookmarks.entity";
import { Images } from "src/images/images.entity";
import { Reviews } from "src/reviews/reviews.entity";

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
    latitude: string;

    @Column("decimal", {precision: 11, scale: 8, nullable: true})
    longitude: string;

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

    @OneToMany(() => PoolImages, (poolImages) => poolImages.pools)
    poolImages: PoolImages[];

    @OneToMany(() => Reviews, (reviews) => reviews.pools)
    reviews: Reviews[];
}


@Entity()
export class PoolImages {
    @PrimaryGeneratedColumn()
    id: number

    // pools 엔티티는 여러 개의 PoolImages 엔티티를 가질 수 있다 - 관계도 (Pools <-- PoolImages)
    @ManyToOne(() => Pools, (pools) => pools.poolImages, {
        onDelete : "CASCADE"
    })
    @JoinColumn({
        name: 'pool_id'
    })
    pools : Pools

    @Column()
    pool_id: number

    // Images 엔티티는 하나의 PoolImages 와 연결된다 - 관계도 (PoolImages <--> Images)
    // 즉, pool_images 테이블은 1대1 관계로서 images 의 PK 를 FK 로 가지므로, images 를 등록 후, pool_images 로 등록해야 한다.
    @OneToOne(() => Images, (images) => images.poolImage, {
        onDelete : "CASCADE"
    })
    @JoinColumn({
        name: "image_id"
    })
    image: Images

    @Column()
    image_id: number
}