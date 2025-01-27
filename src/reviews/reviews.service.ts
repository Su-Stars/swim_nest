import { Injectable, NotFoundException } from '@nestjs/common';
import { Keyword, Review_Keywords, Reviews } from './reviews.entity';
import {  In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetQueryData } from 'src/pools/dto/get-query-data.dto';
import { createReviews } from './dto/createReviews.dto';
import { JwtPayload } from 'src/auth/dto/jwt-payload';
import { Request } from 'express';
import { Pools } from 'src/pools/pools.entity';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Reviews)
        private ReviewsRepository: Repository<Reviews>,

        @InjectRepository(Keyword)
        private KeywordRepository: Repository<Keyword>,

        @InjectRepository(Review_Keywords)
        private Review_Keywords: Repository <Review_Keywords>,

        @InjectRepository(Pools)
        private PoolsRepository: Repository<Pools>
    ) {}

    async getAllPoolsReviews(
        poolId: number,
        query: GetQueryData,
    ) {
        const {limit, page} = query;
        
        const result = await this.ReviewsRepository
        .createQueryBuilder('Reviews')
        .leftJoin('Reviews.users', 'Users')
        .addSelect(['Users.nickname'])
        .where('Reviews.poolId= :id', {id: poolId})
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
            },
            reviews: result
        }
    }

    async addPoolsReviews (
        poolId: number,
        body: createReviews,
        req: Request
    ) {
        const {content, keyword} : createReviews = body;
        const {id} : JwtPayload = req['user']

        if ((await this.PoolsRepository.find({where: {id: poolId}})).length === 0) {
            throw new NotFoundException();
        }

        const keyword_id = await this.KeywordRepository.find({
            where: {
                keyword: In(keyword)
            }
        })

        const reviewsResult = {
            userId: id,
            poolId,
            content,
        }

        const {raw} = await this.ReviewsRepository.insert(reviewsResult)

        await this.Review_Keywords.insert(
            keyword_id.map((i) => ({
                keyword_id: i.id,
                review_id: raw.insertId
            }))
        )

        return {
            status: "success",
            message: "리뷰가 작성되었습니다.",
            data: {
                reviewId: raw.insertId
            }
        }
    }
}
