import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pools } from './pools.entity';
import { Repository } from 'typeorm';
import { GetQueryData } from './dto/get-query-data.dto';
import { createPool } from './dto/createPool.dto';

@Injectable()
export class PoolsService {
    constructor(
        @InjectRepository(Pools)
        private PoolsRepository: Repository<Pools>
    ) {}

    // Pool 전체 조회
    async getAllPools(Query: GetQueryData): Promise<any> {
        const {page, limit, region, keyword} = Query;
        
        // 전체 조회
        if (region === 'all' && keyword === 'all') {
            return {
                stauts: "success",
                message: "지역별 수영장 목록 조회 성공",
                data: {
                    total: await this.PoolsRepository.count(),
                    page,
                    limit,
                    pools: await this.PoolsRepository.find({
                        select: ['id', 'name', 'address'],
                        take: limit,
                        skip: (page -1) * limit,
                    })
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
                    'pool.free_swim_link AS freeSwimLink',
                    'pool.swim_lesson_link AS swimLessonLink',
                    'pool.lane_info AS laneInfo',
                    'pool.depth_info AS depthInfo',
                    'pool.is_soap_provided AS isSoapProvided',
                    'pool.is_towel_provided AS isTowelProvided',
                    'pool.is_kickboard_allowed AS isKickboardAllowed',
                    'pool.is_fins_allowed AS isFinsAllowed',
                    'pool.is_kickboard_rental AS isKickboardRental',
                    'pool.is_diving_allowed AS isDivingAllowed',
                    'pool.is_photo_allowed AS isPhotoAllowed'
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
    async adminCreatePool(token: string, body: createPool) {
        if (!token) {
            throw new UnauthorizedException({
                message: "토큰이 존재하지 않습니다."
            })
        }
        
        if (token === 'user') {
            throw new ForbiddenException({
                message: "권한이 존재하지 않습니다."
            })
        } else if (token === 'admin') {
            const {id} = await this.PoolsRepository.save(body);

            return {
                status: "success",
                message: "수영장 정보가 추가되었습니다.",
                data: {id}
            }
        }
    }

    // 관리자 pool 수정
    async adminUpdatePool (token: string, poolId: number, body: createPool) {
        if (!token) {
            throw new UnauthorizedException({
                message: "토큰이 존재하지 않습니다."
            })
        }

        if (token === 'user') {
            throw new ForbiddenException({
                message: "권한이 존재하지 않습니다."
            })
        } else if (token === 'admin') {
            const checkPool = await this.PoolsRepository.find({where : {id: poolId}})
            if (checkPool.length === 0) {
                throw new NotFoundException();
            }

            await this.PoolsRepository.update({id: poolId}, body)
            return {
                status: "success",
                message: "수영장 정보가 수정되었습니다."
            }
            
        }
    }

    // 관리자 Pool 삭제
    async adminDeletePool(token: string, poolId: number) {
        
        if (!token) {
            throw new UnauthorizedException({
                message: "토큰이 존재하지 않습니다."
            })
        }
        
        if (token === 'user') {
            throw new ForbiddenException({
                message: "권한이 존재하지 않습니다."
            })
        } else if (token === 'admin') {
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
}