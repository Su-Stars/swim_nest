import { Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('api/v1/images')
export class ImagesController {
    constructor(private imagesService: ImagesService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImages (
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
    ) {
        return await this.imagesService.uploadImages(req, file);
    }
}
