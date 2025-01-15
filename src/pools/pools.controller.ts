import { Body, Controller, Get, HttpCode, ParseIntPipe, Post, Query } from '@nestjs/common';
import { PoolsService } from './pools.service';
import { GetQueryData } from './dto/get-query-data.dto';
import { Pools } from './pools.entity';

@Controller('api/v1/pools')
export class PoolsController {
    constructor(private poolsService: PoolsService) {}

    // 수영장 정보 조회
    @Get()
    @HttpCode(200)
    getAllPools(
        @Query() Query: GetQueryData
    ) {
        return this.poolsService.getAllPools(Query)
    }
}
