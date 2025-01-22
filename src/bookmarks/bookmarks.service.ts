import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PostBookmarksDto } from "./dto/postBookmarks.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Bookmarks } from "./bookmarks.entity";
import { Repository } from "typeorm";
import { Users } from "../users/users.entity";
import { Pools } from "../pools/pools.entity";

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmarks) private bookmarksRepository : Repository<Bookmarks>,
  ) {
  }

  async newBookmarks(id: number, poolId : number) {

    // 새로운 수영장 북마크 추가 전에, 이미 추가해 놨는지 확인하기 - 동일한 유저,수영장 쌍이 있다면, 안된다.
    const isAlreadyEntity = await this.bookmarksRepository.findOneBy({
      users : {
        id : id
      },
      pools : {
        id : poolId
      }
    })

    // 이미 등록했으므로, 예외 던지기
    if(isAlreadyEntity) {
      throw new HttpException({
        message : "이미 등록한 수영장 북마크입니다."
      }, HttpStatus.CONFLICT)
    }

    // 릴레이션을 사용하기 위해서는 "user_id", "pool_id" 컬럼을 직접 입력하는 것이 아니라,
    // 엔티티 파일 내에서 해당 컬럼과 연결된 Users, Pools 엔티티에 옵션을 추가하는 방식으로 생성 및 검색한다.
    const newBookMarkEntity = this.bookmarksRepository.create({
      users : {
        id : id,
      } as Users,
      pools : {
        id : poolId
      } as Pools
    });

    // 새로운 북마크 엔티티를 저장한다.
    const bookmark = await this.bookmarksRepository.save(newBookMarkEntity);

    return bookmark;
  }

  // 유저가 등록한 모든 북마크 수영장 리스트 반환
  async getMyBookmarks(user_id : number) {
    // typeorm 에서 where 절을 사용하는 방식, 릴레이션(디폴트 LeftJoin), 순서를 결정하는 방식이 특이하다고 생각한다.
    const bookmarkList = await this.bookmarksRepository.find({
      where : {
        users : {
          id : user_id
        }
      },
      relations : {
        pools : true
      },
      order : {
        created_at : "DESC"
      }
    });

    // 유저가 등록한 수영장 북마크가 없다면, NOT FOUND 에러 던지기
    if(bookmarkList.length === 0) {
      throw new HttpException({
        message : "어떠한 수영장도 북마크하지 않았습니다.",
        status : "fail"
      }, HttpStatus.NOT_FOUND);
    }

    // "pools" 수영장 정보에 수많은 속성이 있어 그 중 "수영장 id", "수영장 이름", "수영장 주소" 를 반환한다.
    return bookmarkList.map((bookmark) => ({
      id : bookmark.id,
      pool : {
        id : bookmark.pools.id,
        name : bookmark.pools.name,
        address : bookmark.pools.address
      },
      created_at : bookmark.created_at
    }));
  }

  async deleteMyBookmarks(user_id : number, bookmark_id : number) {
    const result = await this.bookmarksRepository.delete({
      id : bookmark_id,
      users : {
        id : user_id
      }
    })

    if(result.affected === 0) {
      throw new HttpException({
        status : "fail",
        message : "이미 삭제된 북마크입니다."
      }, HttpStatus.NOT_FOUND);
    }

    return;
  }
}
