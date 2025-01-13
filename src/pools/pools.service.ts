import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pools } from './pools.entity';
import { Repository } from 'typeorm';
import { GetQueryData } from './dto/get-query-data.dto';

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
                    'pool.depth_Info AS depthInfo',
                    'pool.is_Soap_Provided AS isSoapProvided',
                    'pool.is_Towel_Provided AS isTowelProvided',
                    'pool.is_Kickboard_Allowed AS isKickboardAllowed',
                    'pool.is_Fins_Allowed AS isFinsAllowed',
                    'pool.is_Kickboard_Rental AS isKickboardRental',
                    'pool.is_Diving_Allowed AS isDivingAllowed',
                    'pool.is_Photo_Allowed AS isPhotoAllowed'
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
}