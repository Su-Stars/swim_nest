import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/v1/images')
export class ImagesController {
    constructor(private imagesService: ImagesService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImages (@UploadedFile() file: Express.Multer.File) {
        return await this.imagesService.uploadImages(file);
    }
}
