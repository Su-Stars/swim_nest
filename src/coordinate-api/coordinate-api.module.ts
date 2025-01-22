import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CoordinateApiService } from './coordinate-api.service';

@Module({
    imports: [HttpModule],
    providers: [CoordinateApiService],
    exports: [CoordinateApiService]
})
export class CoordinateApiModule {}
