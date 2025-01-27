import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    SerializeOptions,
    UnauthorizedException,
    UploadedFile,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from "@nestjs/common";
import { PoolsService } from './pools.service';
import { GetQueryData } from './dto/get-query-data.dto';
import { createPool } from './dto/createPool.dto';
import { Request } from 'express';
import { updatePool } from './dto/updatePool.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from 'src/images/images.service';
import { JwtPayload } from "../auth/dto/jwt-payload";


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
        @Query() query: GetQueryData,
        @Req() req : Request
    ): Promise<any> {
        return this.poolsService.getAllPools(query, req)
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

    // 로그인이 되어 있는 상태에서, 해당 수영장이 내가 북마크 한 수영장인지 확인하여 반환한다.
    @Get(":poolId/bookmarked")
    @HttpCode(HttpStatus.OK)
    async isBookmarked(@Param("poolId", ParseIntPipe) poolId : number, @Req() req : Request) {
        const jwtPayload : JwtPayload = req["user"];

        const {id} = jwtPayload;

        // null 이거나, { bookId : number, isBookMarked : boolean } 으로 반환되어 옴.
        const isMarkedObj = await this.poolsService.isBookmarked(id, poolId);

        return {
            status : "success",
            message : "북마크 되어 있습니다.",
            data : isMarkedObj
        }
    }


    // 관리자 수영장 삭제
    @Delete('/:poolId')
    @HttpCode(200)
    async adminDeletePool ( 
        @Req() req: Request,
        @Param('poolId', ParseIntPipe) poolId: number
    ) {
        return await this.poolsService.adminDeletePool(req, poolId);
    }


    // 관리자 수영장 이미지 추가
    @Post('/images/:poolId')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('pool'))
    async uploadImages (
        @Req() req: Request,
        @Param('poolId', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (await this.poolsService.getByIdPool(id)){
            const imageResult: any = await this.imagesService.uploadImages(req, file, id)
            return await this.poolsService.adminUploadImage(id, imageResult)
        }
    }
}

