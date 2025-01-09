import { Injectable } from '@nestjs/common';
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

    async getAllPools(Query: GetQueryData) {
        const {page, limit, region} = Query;

        // 전체 조회
        if (region === 'all') {
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

        // 지역 별 조회
        const regionData = await this.PoolsRepository.query(
            `SELECT id, name, address FROM pools
            WHERE MATCH(address) AGAINST (?)`,
            [region]
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
                        WHERE MATCH(address) AGAINST (?)
                        LIMIT ? OFFSET ?
                        `, [region, Number(limit), Number((page - 1) * limit)])
                }
        }
    }

    
}
}