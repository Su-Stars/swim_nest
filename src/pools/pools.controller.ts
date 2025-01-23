import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, Req, SerializeOptions, UnauthorizedException, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { PoolsService } from './pools.service';
import { GetQueryData } from './dto/get-query-data.dto';
import { createPool } from './dto/createPool.dto';
import { Request } from 'express';
import { updatePool } from './dto/updatePool.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from 'src/images/images.service';


@Controller('api/v1/pools')
export class PoolsController {
    constructor(
        private poolsService: PoolsService,
        private imagesService: ImagesService
    ) {}
    
    // 수영장 정보 조회
    @Get()
    @HttpCode(200)
    getAllPools(
        @Query() query: GetQueryData
    ): Promise<any> {
        return this.poolsService.getAllPools(query)
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
        @Req() req: Request,
        @Body() body: createPool
    ) {
        return await this.poolsService.adminCreatePool(req, body)
    }
    
    // 관리자 수영장 수정
    @Patch('/:poolId')
    @HttpCode(200)
    async adminUpdatePool ( 
        @Req() req: Request,
        @Body() body: updatePool,
        @Param('poolId', ParseIntPipe) poolId : number
    ) {
        return this.poolsService.adminUpdatePool(req, poolId, body)
    }

    // 관리자 수영장 삭제
    @Delete('/:poolId')
    @HttpCode(200)
    async adminDeletePool ( 
        @Req() req: Request,
        @Param('poolId', ParseIntPipe) poolId: number
    ) {
        return await this.poolsService.adminDeletePool(req, poolId)
    }

    // 관리자 수영장 이미지 추가
    @Post('/images/:poolId')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('pools'))
    async uploadImages (@UploadedFile() file: Express.Multer.File) {
        this.imagesService.uploadImages(file)
    }
}

