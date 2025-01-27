import { Pools } from "src/pools/pools.entity";
import { Users } from "src/users/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
    reviews_pool_id: Pools;

    @Column()
    pool_id: number;

    @ManyToOne(() => Users, (users) => users.reviews, {
        onDelete: "CASCADE"
    })
    @JoinColumn({
        name: "user_id"
    })
    reviews_user_id: Users;

    @Column({name: "user_id"})
    userId: number;

    @Column('text')
    content: string;

    @CreateDateColumn({name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp", nullable: true, default: null })
    updatedAt: Date | null;

    @OneToMany(() => Review_Keywords, (review_keywords) => review_keywords.review_keywords_reviews_id)
    review_keywords: Review_Keywords[];
}

@Entity()
export class Keyword {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    keyword: string;

    @OneToMany(() => Review_Keywords, (review_keywords) => review_keywords.review_keywords_keyword_id)
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
    review_keywords_reviews_id: Reviews

    @Column()
    review_id: number

    
    @ManyToOne(() => Keyword, (keyword) => keyword.review_keywords, {
        onDelete: "CASCADE"
    })

    @JoinColumn({
        name: "keyword_id"
    })
    review_keywords_keyword_id: Keyword
    
    @Column()
    keyword_id: number;
}