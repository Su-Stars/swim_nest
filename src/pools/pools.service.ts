import {
    ForbiddenException,
    forwardRef,
    HttpException,
    HttpStatus, Inject,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { PoolImages, Pools } from './pools.entity';
import { FindOperator, FindOptionsWhere, In, Like, Repository } from "typeorm";
import { GetQueryData } from './dto/get-query-data.dto';
import { createPool } from './dto/createPool.dto';
import { Request } from 'express';
import { JwtPayload } from '../auth/dto/jwt-payload';
import { BookmarksService } from "../bookmarks/bookmarks.service";
import { CoordinateApiService } from '../coordinate-api/coordinate-api.service';
import { updatePool } from './dto/updatePool.dto';
import { AuthService } from "../auth/auth.service";
import { Images } from "../images/images.entity";
import { ImagesService } from "../images/images.service";


@Injectable()
export class PoolsService {
    constructor(
        @InjectRepository(Pools)
        private PoolsRepository: Repository<Pools>,

        @InjectRepository(PoolImages)
        private poolImagesRepository: Repository<PoolImages>,

        private coordinateAPI: CoordinateApiService,
        private readonly bookmarksService : BookmarksService,

        private readonly authService : AuthService,

        private readonly imageService : ImagesService
    ) {}

    async addToMyBookmark(user_id : number, pool_id : number) {
        const isExistPools = await this.PoolsRepository.exists({
            where : {
                id : pool_id
            }
        })

        // invalid 한 수영장 번호 입력 시 404 반환
        if(!isExistPools) {
            throw new HttpException({
                status : "error",
                message : "존재하지 않는 수영장 번호를 입력하셨습니다."
            }, HttpStatus.NOT_FOUND)
        }

        // 북마크가 있다면, 반환되며, 이미 북마크 하였다면, 409 예외를 반환
        const bookmark = await this.bookmarksService.newBookmarks(user_id, pool_id);

        return bookmark;
    }

    async deleteMyBookmark(user_id : number, pool_id : number) {
        // 존재하는 수영장인지 확인
        const isExistPool = await this.PoolsRepository.exists({
            where : {
                id : pool_id
            }
        });

        // 없는 수영자이면 404 반환
        if(!isExistPool) {
            throw new HttpException({
                status : "error",
                message : "존재하지 않는 수영장 번호를 입력하셨습니다."
            }, HttpStatus.NOT_FOUND)
        }

        // 북마크가 되어 있는 건지 확인
        const bookmark = await this.bookmarksService.isBookmarked(user_id, pool_id);

        // 이미 북마크 해제했거나, 아예 북마크를 한 적이 없다면, 406 반환
        if(!bookmark.isBookMarked){
            throw new HttpException({
                status : "error",
                message : "없는 북마크를 삭제 할 수 없습니다."
            }, HttpStatus.NOT_ACCEPTABLE)
        }

        await this.bookmarksService.deleteMyBookmarks(user_id, bookmark.bookId)
    }

    // Pool 전체 조회 - 비인가 유저 혹은 인가 유저 사용 메서드
    async getAllPools(query: GetQueryData, req : Request): Promise<any> {
        let {page, limit, region, keyword} = query;

        // 유저가 북마크 해 둔 수영장이 없다면, 빈 배열을 유지한다.
        let userBookmarkPoolIds : number[] = [];

        if(req.cookies["refresh_token"]) {
            const refresh : string = req.cookies["refresh_token"];

            const {id} = await this.authService.validateRefreshToken(refresh.replace("Bearer", ""));

            const bookmarks = await this.bookmarksService.getMyBookmarks(id);

            // 유저의 북마크 반환 형태에서, 수영장 ID 만 추출하여 반환.

            if(bookmarks.length !== 0) {
                userBookmarkPoolIds = bookmarks.map((bookmark) => {
                    return bookmark.pool.id
                })
            }
        }

        // 전체 조회
        if (region === 'all' && keyword === 'all') {
            const searchAllPools  = await this.PoolsRepository.find({
                select: ['id', 'name', 'address', 'longitude', 'latitude'],
                take: limit,
                skip: (page -1) * limit,
                relations : {
                    poolImages : {
                        image : true
                    },
                }
            });

            const poolAndThumbnail = searchAllPools.map((pool) => {
                const {id, name, address, longitude, latitude, poolImages} = pool;

                let thumbnail = undefined;
                let isBookMarked = false;

                // 해당 수영장에 대한 사진이 있다면, 첫 번째를 골라 제공하겠다.
                if(poolImages.length !== 0) {
                    thumbnail = poolImages[0].image.url;
                }
                if(userBookmarkPoolIds.includes(id)){
                    isBookMarked = true;
                }


                return {
                    id : id,
                    name : name,
                    address : address,
                    longitude : parseFloat(longitude),
                    latitude : parseFloat(latitude),
                    thumbnail,
                    isBookMarked
                }
            })

            return {
                status: "success",
                message: "전체 수영장 목록 조회 성공",
                data: {
                    total: await this.PoolsRepository.count(),
                    page,
                    limit,
                    pools : poolAndThumbnail
                }
            }
        }

        region = region === "all" ? null : region;
        keyword = keyword === "all" ? null : keyword;

        // region 혹은 keyword 가 비어있지 않은 경우.
        let addressTokens : string[] = [];

        let addressSearch= "%";


        const whereOption :  FindOptionsWhere<Pools> | FindOptionsWhere<Pools>[] = {}

        // 지역 검색 문자열이 존재했다면
        if(region){
            // 받아온 지역 정보의 문자열 앞뒤 빈 문자열을 지우고, 빈 칸으로 나눈다.
            addressTokens = region.trim().split(" ");

            // 이건 오류 예방인데, 지역 간 띄어쓰기가 2칸, 3칸일 때를 대비.
            addressTokens = addressTokens.map((token) => {
                // "경기도 " 이런 식으로 나뉘어 졌다면, "경기도" 로 만들어주는 작업.
                return token.trim();
            })


            // "%서울%서초%" 이러한 형식으로 구성 - LIKE 사용할 것이므로
            for(let token of addressTokens) {
                addressSearch += (token + "%");
            }

            whereOption.address = Like(addressSearch)
        }

        // 키워드 (수영장 이름) 이 존재했다면,
        if(keyword) {
            const searchName = `%${keyword}%`
            whereOption.name = Like(searchName);
        }

        const [searchAllPools, totalNumber]  = await this.PoolsRepository.findAndCount({
            select: ['id', 'name', 'address', 'longitude', 'latitude'],
            take: limit,
            skip: (page -1) * limit,
            relations : {
                poolImages : {
                    image : true
                }
            },
            where : whereOption
        });

        const poolAndThumbnail = searchAllPools.map((pool) => {
            const { id, name, address, longitude, latitude, poolImages } = pool;

            let thumbnail = undefined;
            let isBookMarked = false;

            // 해당 수영장에 대한 사진이 있다면, 첫 번째를 골라 제공하겠다.
            if (poolImages.length !== 0) {
                thumbnail = poolImages[0].image.url;
            }
            if(userBookmarkPoolIds.includes(id)){
                isBookMarked = true;
            }

            return {
                id: id,
                name: name,
                address: address,
                longitude : parseFloat(longitude),
                latitude : parseFloat(latitude),
                thumbnail,
                isBookMarked
            }
        });

        if(totalNumber === 0) {
            throw new HttpException({
                status : "error",
                message : "조건에 맞는 수영장을 찾지 못했습니다."
            }, HttpStatus.NOT_FOUND)
        }

        return {
            status: "success",
            message: "조건에 맞는 수영장 목록 조회 성공",
            data: {
                total: totalNumber,
                page,
                limit,
                pools : poolAndThumbnail
            }
        }
    }

    // Pool id 조회
    async getByIdPool(poolId: number) {
        
        const pool = await this.PoolsRepository.findOne(
          {
              where : {
                  id : poolId
              },
              relations : {
                  poolImages : {
                      image : true
                  }
              }
          }
        )

        if (!pool) {
          throw new HttpException({
              status : "error",
              message : "존재하지 않는 수영장 id 를 검색하셨습니다."
          }, HttpStatus.NOT_FOUND);
        }

        const data = {
            ...pool,
            longitude : parseFloat(pool.longitude),
            latitude : parseFloat(pool.latitude),
            images : pool.poolImages.map((poolImage) => {
                return poolImage.image.url
            })
        }

        delete data.poolImages;

        // 이미지는 추후 추가
        return {
          status: 'success',
          message: '수영장 정보 조회 성공',
          data: data,
        };
    }

    // 관리자 Pool 추가
    async adminCreatePool(req: Request, body: createPool) {
        const {role} : JwtPayload = req["user"]
        const {address} : createPool = body
        const { longitude, latitude } = await this.coordinateAPI.fechData(address)

        if (role === 'user') {
            throw new ForbiddenException({
                status : "fail",
                message: "일반 유저는 수영장을 등록할 수 없습니다."
            })
        } else if (role === 'admin') {
            const { identifiers } = await this.PoolsRepository.insert({...body, longitude : longitude, latitude});

            return {
                status: "success",
                message: "수영장 정보가 추가되었습니다.",
                data: identifiers[0].id
            }
        }
    }

    // 관리자 pool 수정
    async adminUpdatePool (req: Request, poolId: number, body: updatePool) {
        const {role} : JwtPayload = req["user"]

        if (role === 'user') {
            throw new ForbiddenException({
                status : "fail",
                message: "일반 유저는 수영장 정보를 수정 할 수 없습니다."
            })
        }

        const checkPool = await this.PoolsRepository.find({where : {id: poolId}})
            if (checkPool.length === 0) {
                throw new HttpException({
                    status : "error",
                    message : "수정하려는 수영장이 존재하지 않습니다."
                }, HttpStatus.NOT_FOUND);
            }


        if (body.address) {
            const {address} : updatePool = body;
            const { longitude, latitude } = await this.coordinateAPI.fechData(address);

            await this.PoolsRepository.update({id: poolId}, {...body, longitude : longitude, latitude})
            return {
                status: "success",
                message: "수영장 정보가 수정되었습니다."
            }
        } else {   
            await this.PoolsRepository.update({id: poolId}, body)
            return {
                status: "success",
                message: "수영장 정보가 수정되었습니다."
            }
        }
    }

    // 관리자 Pool 삭제
    async adminDeletePool(req: Request, poolId: number) {
        const {role} : JwtPayload = req["user"]

        if (role === 'user') {
            throw new ForbiddenException({
                status : "fail",
                message: "일반 유저는 수영장을 삭제할 수 없습니다."
            })
        } else if (role === 'admin') {
            const checkPool = await this.PoolsRepository.find({where : {id: poolId}})
            if (checkPool.length === 0){
                throw new HttpException({
                    status : "error",
                    message : "삭제하려는 수영장이 존재하지 않습니다."
                }, HttpStatus.NOT_FOUND);
            }

            await this.PoolsRepository.delete({id: poolId})
            return {
                status: "success",
                message: "수영장 정보가 삭제되었습니다."
            }
        }
    }

    async isBookmarked(user_id : number, pool_id : number) {
        const isExistPool = await this.PoolsRepository.findOneBy({
            id : pool_id
        })

        if(!isExistPool) {
            throw new HttpException({
                status : "error",
                message : "존재하지 않는 수영장 번호를 입력하셨습니다."
            }, HttpStatus.NOT_FOUND)
        }

        const isBookmarked = await this.bookmarksService.isBookmarked(user_id, pool_id);

        return isBookmarked;
    }

    async adminUploadImage (id: number, imageResult: any) {
        const {identifiers, data, generatedMaps} = imageResult

        await this.poolImagesRepository.createQueryBuilder()
        .insert()
        .into(PoolImages)
        .values({
            pool_id: id,
            image_id: identifiers[0].id
        })
        .execute();

        const replace = {
            imageUrl: data.url,
            fileName: data.filename,
            fileSize: data.size,
            mimeType: data.mimetype,
            uploadedAt: generatedMaps[0].uploaded_at
        }

        return {
            status: "success",
            message: "이미지 업로드에 성공했습니다.",
            data: replace
        }
    }

    async uploadPoolImageUrl(pool_id : number, image_urls : string[]) {
        const imageEntities : Images[] = await this.imageService.adminSaveImageUrl(image_urls);

        const poolImageEntities : PoolImages[] = imageEntities.map((imageEntity) => ({
            pool_id : pool_id,
            image_id : imageEntity.id
        }) as PoolImages);

        const result = await this.poolImagesRepository.save(poolImageEntities);

        return result;
    }
}