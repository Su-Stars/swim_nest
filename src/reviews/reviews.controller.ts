import { Controller, Get, HttpException, HttpStatus, Query, Req } from "@nestjs/common";
import { Request } from "express";
import { GetReviewQueryDto } from "./dto/getReviewQuery.dto";
import { ApiCookieAuth } from "@nestjs/swagger";
import { JwtPayload } from "../auth/dto/jwt-payload";
import { ReviewsService } from "./reviews.service";

@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService : ReviewsService
  ) {}

  @Get()
  @ApiCookieAuth()
  async adminGetReviews(@Req() req : Request, @Query() getReviewQuery : GetReviewQueryDto) {
    const jwtPayload : JwtPayload = req["user"];

    const {role} = jwtPayload;

    if(role === "user") {
      throw new HttpException({
        status : "fail",
        message : "관리자만 전체 리뷰 조회 접근 권한이 있습니다."
      }, HttpStatus.FORBIDDEN)
    }

    return await this.reviewsService.adminGetReviews(getReviewQuery);
  }
}
