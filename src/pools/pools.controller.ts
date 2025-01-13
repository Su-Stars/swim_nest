import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { PoolsService } from './pools.service';
import { GetQueryData } from './dto/get-query-data.dto';
import { createPool } from './dto/createPool.dto';

@Controller('api/v1/pools')
export class PoolsController {
    constructor(private poolsService: PoolsService) {}

    // 수영장 정보 조회
    @Get()
    @HttpCode(200)
    getAllPools(
        @Query() Query: GetQueryData
    ): Promise<any> {
        return this.poolsService.getAllPools(Query)
    }

    // 개별 수영장 조회
    @Get('/:poolId')
    @HttpCode(200)
    getByIdPool(
        @Param('poolId') poolId: number
    ) {
        return this.poolsService.getByIdPool(poolId);
    }

    // 관리자 수영장 추가
    @Post()
    @HttpCode(200)
    adminCreatePool(
        @Body() body: createPool 
    ) {

    }
    
}
