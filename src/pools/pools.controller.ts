import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Headers, HttpCode, Param, ParseIntPipe, Patch, Post, Query, SerializeOptions, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
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
        @Param('poolId', ParseIntPipe) poolId: number
    ) {
        return this.poolsService.getByIdPool(poolId);
    }

    
    // 관리자 수영장 추가
    @Post()
    @HttpCode(200)
    async adminCreatePool(
        @Headers('authorization') token: string,
        @Body() body: createPool
    ) {
        return await this.poolsService.adminCreatePool(token, body)
    }
    
    // 관리자 수영장 수정
    @Patch('/:poolId')
    @HttpCode(200)
    async adminUpdatePool (
        @Headers('authorization') token: string,
        @Body() body: createPool,
        @Param('poolId', ParseIntPipe) poolId: number
    ) {
        return this.poolsService.adminUpdatePool(token, poolId, body)
    }

    // 관리자 수영장 삭제
    @Delete('/:poolId')
    @HttpCode(200)
    async adminDeletePool (
        @Headers('authorization') token: string,
        @Param('poolId', ParseIntPipe) poolId: number
    ) {
        return await this.poolsService.adminDeletePool(token, poolId)
    }
}
