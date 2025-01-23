import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { Images } from './images.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Images]),
        MulterModule.register({
            limits: {
                fileSize: 10 * 1024 * 1024
            }
        })
    ],
    providers: [ImagesService],
    exports : [
        ImagesService,
        ConfigModule,
        TypeOrmModule,
        MulterModule
    ]
})
export class ImagesModule {}
