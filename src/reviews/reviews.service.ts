import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Keyword, Review_Keywords, Reviews } from './reviews.entity';
import {  In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetQueryData } from 'src/pools/dto/get-query-data.dto';
import { createReviews } from './dto/createReviews.dto';
import { JwtPayload } from 'src/auth/dto/jwt-payload';
import { Request } from 'express';
import { Pools } from 'src/pools/pools.entity';
import { updateReviews } from './dto/updateReviews.dto';
import { GetReviewQueryDto } from "./dto/getReviewQuery.dto";

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
        
        if (result.length === 0) {
            throw new NotFoundException
        }

        return {
            status: "success",
            message: "수영장 리뷰 목록 조회 성공",
            data: {
                total: await this.ReviewsRepository.count({
                    where: {
                        poolId: poolId
                    }
                }),
                page,
                limit,
                reviews: result
            },
        }
    }

    async addPoolsReviews (
        poolId: number,
        body: createReviews,
        req: Request
    ) {
        const {content, keyword} : createReviews = body;
        const {id} : JwtPayload = req["user"]

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


    async userUpdatepoolsReviews (
        poolId: number,
        reviewId: number,
        body: updateReviews,
        req: Request
    ) {
        const {content, keyword} : updateReviews = body
        const {id} = req["user"]

        const checkReviews = await this.ReviewsRepository.find({
            where: {
                poolId: poolId,
                id: reviewId
            }
        })

        if (checkReviews.length === 0) {
            throw new NotFoundException()
        }

        if (!content && keyword.length === 0) {
            throw new BadRequestException();
        } else if (!content) {
            const keyword_id = await this.KeywordRepository.find({
                where: {
                    keyword: In(keyword)
                }
            })

            await this.Review_Keywords.delete({review_id: reviewId})

            await this.Review_Keywords.save(
                keyword_id.map((i) => ({
                    keyword_id: i.id,
                    review_id: reviewId
                }))
            )

            return {
                status: "success",
                message: "리뷰가 수정되었습니다."
            }
            
        }

        const myReviews = await this.ReviewsRepository.find({
            where: {
                poolId: poolId,
                id: reviewId,
                userId: id
            }
        })

        if (myReviews.length === 0) {
            throw new ForbiddenException({
                message: "권한이 존재하지 않습니다."
            })
        }

        await this.ReviewsRepository
        .createQueryBuilder()
        .update(Reviews)
        .set({
            content: content,
            updatedAt: new Date()
        })
        .where("poolId = :poolId", {poolId: poolId})
        .andWhere("userId = :userId", {userId: id})
        .andWhere("id = :id", {id: reviewId})
        .execute();

        if (keyword.length === 0) {
            return {
                status: "success",
                message: "리뷰가 수정되었습니다."
            }
        }

        const keyword_id = await this.KeywordRepository.find({
            where: {
                keyword: In(keyword)
            }
        })

        await this.Review_Keywords.delete({review_id: reviewId})

        await this.Review_Keywords.save(
            keyword_id.map((i) => ({
                keyword_id: i.id,
                review_id: reviewId
            }))
        )

       
            return {
                status: "success",
                message: "리뷰가 수정되었습니다."
            }
        
    }

    async deletePoolsReviews (
        poolId: number,
        reviewId: number,
        req: Request
    ) {
        const {id, role} = req['user']

        const checkReviews = await this.ReviewsRepository.find({
            where: {
                poolId: poolId,
                id: reviewId
            }
        })

        if (checkReviews.length === 0) {
            throw new NotFoundException()
        }

        // 어드민은 모든 리뷰룰 삭제할 수 있다.
        if (role === 'admin') {
            await this.ReviewsRepository.delete({
                id: reviewId,
                poolId: poolId
            })

            // CASECADE 때문에 사용 안해도 됨
            // await this.Review_Keywords.delete({
            //     review_id: reviewId
            // })

            return {
                status: "success",
                message: "리뷰가 삭제되었습니다."
            }
        }

        const myReviews = await this.ReviewsRepository.find({
            where: {
                poolId: poolId,
                id: reviewId,
                userId: id
            }
        })

        if (myReviews.length === 0) {
            throw new ForbiddenException({
                message: "권한이 존재하지 않습니다."
            })
        }

        await this.ReviewsRepository.delete({
            id: reviewId,
            poolId: poolId,
            userId: id
        })

        return {
            status : "success",
            message : "리뷰가 삭제되었습니다."
        }
    }

    async adminGetReviews(query : GetReviewQueryDto) {
        const {page, limit} = query;

        const [reviews, count] = await this.ReviewsRepository.findAndCount({
            skip : (page - 1) * limit,
            take : limit,
            order : {
                createdAt : "DESC"
            },
            relations : {
                review_keywords : {
                    keyword : true
                }
            }
        })


        return {
          status: 'success',
          message: '전체 리뷰 목록 조회 성공',
          data: {
            total: count,
            page: page,
            limit: limit,
            reviews: reviews.map((review) => ({
              ...review,
              review_keywords: review.review_keywords.map((keyword) => {
                return keyword.keyword.keyword;
              }),
            })),
          },
        };
    }
}
