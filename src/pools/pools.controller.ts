import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Headers, HttpCode, Param, ParseIntPipe, Patch, Post, Query, Req, SerializeOptions, UnauthorizedException, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { PoolsService } from './pools.service';
import { GetQueryData } from './dto/get-query-data.dto';
import { createPool } from './dto/createPool.dto';
import { Request } from 'express';


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
        @Req() Req: Request,
        @Body() body: createPool
    ) {
        if (Req["user"]) {
            throw new UnauthorizedException({
                message: "토큰이 존재하지 않습니다."
            })
        }
        return await this.poolsService.adminCreatePool(Req, body)
    }
    
    // 관리자 수영장 수정
    @Patch('/:poolId')
    @HttpCode(200)
    async adminUpdatePool (
        @Req() Req: Request,
        @Body() body: createPool,
        @Param('poolId', ParseIntPipe) poolId: number
    ) {
        if (Req["user"]) {
            throw new UnauthorizedException({
                message: "토큰이 존재하지 않습니다."
            })
        }
        return this.poolsService.adminUpdatePool(Req, poolId, body)
    }

    // 관리자 수영장 삭제
    @Delete('/:poolId')
    @HttpCode(200)
    async adminDeletePool (
        @Req() Req: Request,
        @Param('poolId', ParseIntPipe) poolId: number
    ) {
        if (Req["user"]) {
            throw new UnauthorizedException({
                message: "토큰이 존재하지 않습니다."
            })
        }
        return await this.poolsService.adminDeletePool(Req, poolId)
    }
}

