import { Injectable } from '@nestjs/common';
import { Keyword, Review_Keywords, Reviews } from './reviews.entity';
import {  Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetQueryData } from 'src/pools/dto/get-query-data.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Reviews)
        private ReviewsRepository: Repository<Reviews>,

        @InjectRepository(Keyword)
        private KeywordRepository: Repository<Keyword>,

        @InjectRepository(Review_Keywords)
        private Review_Keywords: Repository <Review_Keywords>
    ) {}

    async getAllPoolsReviews(
        poolId: number,
        query: GetQueryData,
    ) {
        const {limit, page} = query;
        
        const test = await this.ReviewsRepository
        .createQueryBuilder('Reviews')
        .leftJoinAndSelect('Reviews.userId', 'Users')
        .addSelect(['Users.nickname'])
        .where('Reviews.pool_id= :id', {id: poolId})
        .take(limit)
        .skip((page-1) * limit)
        .getMany();
        

        return {
            status: "success",
            message: "수영장 리뷰 목록 조회 성공",
            data: {
                total: await this.ReviewsRepository.count(),
                page,
                limit,
                summary: {
                }
            },
            reviews: test
        }
    }
}
