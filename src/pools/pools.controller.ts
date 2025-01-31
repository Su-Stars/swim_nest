import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode, HttpException,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post, Put,
    Query,
    Req,
    SerializeOptions,
    UnauthorizedException,
    UploadedFile,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from "@nestjs/common";
import { PoolsService } from './pools.service';
import { GetQueryData } from './dto/get-query-data.dto';
import { createPool } from './dto/createPool.dto';
import { Request } from 'express';
import { updatePool } from './dto/updatePool.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from 'src/images/images.service';
import { JwtPayload } from "../auth/dto/jwt-payload";
import { BookmarksService } from "../bookmarks/bookmarks.service";
import { ImageUrls } from "./dto/image-urls.dto";
import { createReviews } from "src/reviews/dto/createReviews.dto";
import { ReviewsService } from "src/reviews/reviews.service";
import { updateReviews } from "src/reviews/dto/updateReviews.dto";


@Controller('api/v1/pools')
export class PoolsController {
    constructor(
        private poolsService: PoolsService,
        private imagesService: ImagesService,
        private reviewsService: ReviewsService
    ) {}

    // poolId 를 파라미터로 받고, 유저의 파라미터에 추가
    @Post(":pool_id/bookmark")
    @HttpCode(HttpStatus.CREATED) // 201
    async addToMyBookmarks(@Param("pool_id", ParseIntPipe) pool_id : number, @Req() req : Request) {
        const jwtPayload : JwtPayload = req["user"];

        const {id} = jwtPayload;

        const bookmark = await this.poolsService.addToMyBookmark(id, pool_id);

        return {
            status : "success",
            message : "해당 수영장이 내 수영장 목록에 추가되었습니다.",
            data : {
                bookmark_id : bookmark.id
            }
        }
    }

    @Delete(":pool_id/bookmark")
    @HttpCode(HttpStatus.CREATED) // 정석은 ACCEPTED 인듯 (202)
    async deleteMyBookmarks(@Param("pool_id", ParseIntPipe) pool_id : number, @Req() req : Request) {
        const jwtPayload : JwtPayload = req["user"];

        const {id} = jwtPayload;

        await this.poolsService.deleteMyBookmark(id, pool_id);

        return {
            status : "success",
            message : "수영장이 내 수영장 목록에 제거되었습니다."
        }
    }

    // 수영장 정보 조회
    @Get()
    @HttpCode(200)
    async getAllPools(
        @Query() query: GetQueryData,
        @Req() req : Request
    ): Promise<any> {
        return this.poolsService.getAllPools(query, req)
    }

    // 개별 수영장 조회
    @Get('/:poolId')
    @HttpCode(200)
    getByIdPool(
        @Param('poolId', ParseIntPipe) poolId: number
    ) {
        return this.poolsService.getByIdPool(poolId);
    }
    
    // 관리자 수영장 추가
    @Post()
    @HttpCode(200)
    async adminCreatePool(
        @Req() req: Request,
        @Body() body: createPool
    ) {
        return await this.poolsService.adminCreatePool(req, body)
    }
    
    // 관리자 수영장 수정
    @Patch('/:poolId')
    @HttpCode(200)
    async adminUpdatePool ( 
        @Req() req: Request,
        @Body() body: updatePool,
        @Param('poolId', ParseIntPipe) poolId : number
    ) {
        return this.poolsService.adminUpdatePool(req, poolId, body)
    }

    // 로그인이 되어 있는 상태에서, 해당 수영장이 내가 북마크 한 수영장인지 확인하여 반환한다.
    @Get(":pool_id/bookmark")
    @HttpCode(HttpStatus.OK)
    async isBookmarked(@Param("poolId", ParseIntPipe) poolId : number, @Req() req : Request) {
        const jwtPayload : JwtPayload = req["user"];

        const {id} = jwtPayload;

        // null 이거나, { bookId : number, isBookMarked : boolean } 으로 반환되어 옴.
        const isMarkedObj = await this.poolsService.isBookmarked(id, poolId);

        return {
            status : "success",
            data : {
                is_bookmarked : isMarkedObj.isBookMarked,
                bookmark_id : isMarkedObj.bookId
            }
        }
    }


    // 관리자 수영장 삭제
    @Delete('/:poolId')
    @HttpCode(200)
    async adminDeletePool ( 
        @Req() req: Request,
        @Param('poolId', ParseIntPipe) poolId: number
    ) {
        return await this.poolsService.adminDeletePool(req, poolId);
    }


    // 관리자 수영장 이미지 추가
    @Post('/images/:poolId')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('pool'))
    async uploadImages (
        @Req() req: Request,
        @Param('poolId', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (await this.poolsService.getByIdPool(id)){
            const imageResult: any = await this.imagesService.uploadImages(req, file, id)
            return await this.poolsService.adminUploadImage(id, imageResult)
        }
    }

    // 리뷰 조회
    @Get(':poolId/reviews')
    @HttpCode(200)
    async getAllPoolsReviews (
        @Param('poolId') poolId: number,
        @Query() query: GetQueryData
    ) {
        return await this.reviewsService.getAllPoolsReviews(poolId, query)
    }

    // 리뷰 추가
    @Post(':poolId/reviews')
    @HttpCode(200)
    async addPoolsReviews (
        @Param('poolId') poolId: number,
        @Body() body: createReviews,
        @Req() req: Request
    ) {
        return await this.reviewsService.addPoolsReviews(poolId, body, req)
    }

    // 리뷰 수정
    @Patch(':poolId/reviews/:reviewId')
    @HttpCode(200)
    async updatePoolsReviews (
        @Param('poolId') poolId: number,
        @Param('reviewId') reviewId: number,
        @Body() body: updateReviews,
        @Req() req: Request
    ) {
        return await this.reviewsService.userUpdatepoolsReviews(poolId, reviewId, body, req)
    }

    // 리뷰 삭제
    @Delete(':poolId/reviews/:reviewId')
    @HttpCode(200)
    async deletePoolsReviews (
        @Param('poolId') poolId: number,
        @Param('reviewId') reviewId: number,
        @Req() req: Request
    ) {
        return await this.reviewsService.deletePoolsReviews(poolId, reviewId, req)
    }

    // 관리자 수영장 이미지 URL 수동 추가 - 로컬에서 이미지 URL 올리기 위한 임시 메서드
    @Put("images/:pool_id")
    @HttpCode(HttpStatus.ACCEPTED) // 202
    async uploadImageUrl(@Param("pool_id", ParseIntPipe) pool_id : number, @Body() urlBody : ImageUrls) {
        // url 이 없다면, 빈 배열로 들어온다.
        const {imageUrls} = urlBody;

        if(imageUrls.length === 0) {
            throw new HttpException({
                status : "fail",
                message : "어떠한 url 도 들어오지 않았습니다."
            }, HttpStatus.BAD_REQUEST);
        }

        await this.poolsService.uploadPoolImageUrl(pool_id, imageUrls);

        return {
            status : "success",
            message : "이미지 url 업로드에 성공했습니다."
        }
    }
}

