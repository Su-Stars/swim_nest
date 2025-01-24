import {
    ForbiddenException,
    forwardRef,
    HttpException,
    HttpStatus, Inject,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { poolImages, Pools } from './pools.entity';
import { In, Repository } from 'typeorm';
import { GetQueryData } from './dto/get-query-data.dto';
import { createPool } from './dto/createPool.dto';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/dto/jwt-payload';
import { BookmarksService } from "../bookmarks/bookmarks.service";
import { CoordinateApiService } from 'src/coordinate-api/coordinate-api.service';
import { updatePool } from './dto/updatePool.dto';


@Injectable()
export class PoolsService {
    constructor(
        @InjectRepository(Pools)
        private PoolsRepository: Repository<Pools>,

        @InjectRepository(poolImages)
        private poolImagesRepository: Repository<poolImages>,

        private coordinateAPI: CoordinateApiService,
        private readonly bookmarksService : BookmarksService
    ) {}

    // Pool 전체 조회
    async getAllPools(query: GetQueryData): Promise<any> {
        const {page, limit, region, keyword} = query;

        
        const pools = await this.PoolsRepository.find({
            select: ['id', 'name', 'address'],
            take: limit,
            skip: (page -1) * limit,
        })

        const poolImages = await this.poolImagesRepository.find({
            where: { pool_id: In(pools.map(pools => pools.id)) }, 
            relations: ['image'],  
          });

        //   const groupByPoolId = poolImages.reduce((restore, poolImage) => {
        //     if (!restore[poolImage.pool_id]) {
        //         restore[poolImage.pool_id] = poolImage.image_id
        //     }
        //     return restore
        //   }) 
          console.log(poolImages)


        // 전체 조회
        if (region === 'all' && keyword === 'all') {
            return {
                stauts: "success",
                message: "지역별 수영장 목록 조회 성공",
                data: {
                    total: await this.PoolsRepository.count(),
                    page,
                    limit,
                }
            }
        }

        // 문의 바람
        const search = (region + ' ' + keyword).replace(/\ball\b/g, '').trim().replace(/\S+/g, "+$&");
        
        // 지역 별 조회
        const regionData = await this.PoolsRepository.query(
            `SELECT id, name, address FROM pools
            WHERE MATCH(address, name) AGAINST (? IN BOOLEAN MODE)`,
            [search]
        );

        if (regionData.length > 0) {
            return {
                stauts: "success",
                message: "지역별 수영장 목록 조회 성공",
                data: {
                    total: regionData.length,
                    page,
                    limit,
                    pools: await this.PoolsRepository.query(`
                        SELECT id, name, address FROM pools
                        WHERE MATCH(address, name) AGAINST (? IN BOOLEAN MODE)
                        LIMIT ? OFFSET ?
                        `, [search, Number(limit), Number((page - 1) * limit)])
                }
        }
        } else {
            throw new NotFoundException();
        }
    }

    // Pool id 조회
    async getByIdPool(poolId: number): Promise<any> {
        const result = await this.PoolsRepository.createQueryBuilder('pool')
            .select(['pool.id',
                    'pool.name',
                    'pool.address',
                    'pool.phone',
                    'pool.website',
                    'pool.latitude',
                    'pool.longtitude',
                    'pool.freeSwimLink',
                    'pool.swimLessonLink',
                    'pool.laneInfo',
                    'pool.depthInfo',
                    'pool.isSoapProvided',
                    'pool.isTowelProvided',
                    'pool.isKickboardAllowed',
                    'pool.isFinsAllowed',
                    'pool.isKickboardRental',
                    'pool.isDivingAllowed',
                    'pool.isPhotoAllowed'
                    ])
            .where('pool.id = :id', { id: poolId})
            .getMany();
            
            if (result.length === 0) {
                throw new NotFoundException();
            }

            // 이미지는 추후 추가
            return {
                stauts: "success",
                message: "수영장 정보 조회 성공",
                data: result
            }
    }

    // 관리자 Pool 추가
    async adminCreatePool(req: Request, body: createPool) {
        const {role} : JwtPayload = req["user"]
        const {address} : createPool = body
        const { longtitude, latitude } = await this.coordinateAPI.fechData(address)

        if (role === 'user') {
            throw new ForbiddenException({
                message: "권한이 존재하지 않습니다."
            })
        } else if (role === 'admin') {
            const { identifiers } = await this.PoolsRepository.insert({...body, longtitude, latitude});

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
                message: "권한이 존재하지 않습니다."
            })
        }

        const checkPool = await this.PoolsRepository.find({where : {id: poolId}})
            if (checkPool.length === 0) {
                throw new NotFoundException();
            }


        if (body.address) {
            const {address} : updatePool = body
            const { longtitude, latitude } = await this.coordinateAPI.fechData(address)

            await this.PoolsRepository.update({id: poolId}, {...body, longtitude, latitude})
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
                message: "권한이 존재하지 않습니다."
            })
        } else if (role === 'admin') {
            const checkPool = await this.PoolsRepository.find({where : {id: poolId}})
            if (checkPool.length === 0){
                throw new NotFoundException();
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
            }, HttpStatus.BAD_REQUEST)
        }

        const isBookmarked = await this.bookmarksService.isBookmarked(user_id, pool_id);

        return isBookmarked;
    }

    async adminUploadImage (id: number, imageResult: any) {
        const {identifiers, data, generatedMaps} = imageResult

        await this.poolImagesRepository.createQueryBuilder()
        .insert()
        .into(poolImages)
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
}