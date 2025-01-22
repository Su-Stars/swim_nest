import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
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
    controllers: [ImagesController],
    providers: [ImagesService],
    exports: [ImagesService]
})
export class ImagesModule {}
