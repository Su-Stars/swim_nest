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

    async getAllPools(Query: GetQueryData): Promise<[]>{
        
    }
}
