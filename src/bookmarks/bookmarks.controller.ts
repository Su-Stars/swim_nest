import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req } from "@nestjs/common";
import { PostBookmarksDto } from "./dto/postBookmarks.dto";
import { Request } from "express";
import { JwtPayload } from "../auth/dto/jwt-payload";
import { BookmarksService } from "./bookmarks.service";
import { ApiCookieAuth } from "@nestjs/swagger";

@ApiCookieAuth("access-cookie")
@Controller('api/v1/bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService : BookmarksService) {
  }

  // 내 북마크에 새로운 수영장을 추가한다.
  @Post()
  async addBookmarks(@Body() postBookmarksDto: PostBookmarksDto, @Req() req : Request) {
    const jwtPayload : JwtPayload = req["user"];

    const {id} = jwtPayload;

    const {poolId} = postBookmarksDto;

    const newBookmark = await this.bookmarksService.newBookmarks(id, poolId);

    return {
      status : "success",
      message : "수영장 북마크 등록 성공",
      data : newBookmark
    }
  }

  // 내가 추가한 수영장 북마크 리스트를 불러온다.
  @Get()
  async getMyBookmarks(@Req() req : Request) {
    const jwtPayload : JwtPayload = req["user"];

    const {id} = jwtPayload;

    // 유저에게 할당된 수영장 북마크 리스트를 불러온다.
    const bookmarkList = await this.bookmarksService.getMyBookmarks(id);

    return {
      status : "success",
      message : "수영장 목록 조회 성공",
      data : {
        total : bookmarkList.length,
        favorite : bookmarkList
      }
    }
  }

  // 특정 북마크 수영장을 제거한다.
  @Delete(":bookmark_id")
  async deleteMyBookmarks(@Param("bookmark_id", ParseIntPipe) bookmark_id : number, @Req() req : Request) {
    const jwtPayload : JwtPayload = req["user"];

    const {id} = jwtPayload;

    await this.bookmarksService.deleteMyBookmarks(id, bookmark_id);

    return {
      status : "success",
      message : "북마크가 성공적으로 삭제되었습니다."
    }
  }
}
