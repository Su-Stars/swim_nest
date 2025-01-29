import { Pools } from "src/pools/pools.entity";
import { Users } from "src/users/users.entity";
import {
     BeforeUpdate,
     Column,
     CreateDateColumn,
     Entity, 
     JoinColumn, 
     ManyToOne, 
     OneToMany, 
     PrimaryGeneratedColumn, 
     } from "typeorm";

@Entity()
export class Reviews {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Pools, (pools) => pools.reviews, {
        onDelete: "CASCADE"
    })
    @JoinColumn({
        name: "pool_id"
    })
    pools: Pools;

    @Column({name: "pool_id"})
    poolId: number;

    @ManyToOne(() => Users, (users) => users.reviews, {
        onDelete: "CASCADE"
    })
    @JoinColumn({
        name: "user_id"
    })
    users: Users;

    @Column({name: "user_id"})
    userId: number;

    @Column('text')
    content: string;

    @CreateDateColumn({name: "created_at"})
    createdAt: Date;

    @Column({ type: "timestamp", nullable: true})
    updatedAt: Date | null;

    @OneToMany(() => Review_Keywords, (review_keywords) => review_keywords.reviews)
    review_keywords: Review_Keywords[];
}

@Entity()
export class Keyword {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    keyword: string;

    @OneToMany(() => Review_Keywords, (review_keywords) => review_keywords.keyword)
    review_keywords: Review_Keywords[];
}

@Entity()
export class Review_Keywords {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Reviews, (reviews) => reviews.review_keywords, {
        onDelete: 'CASCADE'
    })

    @JoinColumn({
        name: "review_id"
    })
    reviews: Reviews

    @Column()
    review_id: number

    
    @ManyToOne(() => Keyword, (keyword) => keyword.review_keywords, {
        onDelete: "CASCADE"
    })

    @JoinColumn({
        name: "keyword_id"
    })
    keyword: Keyword
    
    @Column()
    keyword_id: number;
}