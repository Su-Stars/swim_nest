import { Body, Controller, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { PoolsService } from './pools.service';
import { GetQueryData } from './dto/get-query-data.dto';

@Controller('api/v1/pools')
export class PoolsController {
    constructor(private poolsService: PoolsService) {}

    @Get()
    getAllPools(
        @Query() Query: GetQueryData
    ) {
        this.poolsService.getAllPools(Query)
    }
}
