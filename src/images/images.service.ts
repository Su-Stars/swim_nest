import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ForbiddenException, Injectable, NotFoundException, UnsupportedMediaTypeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { Repository } from 'typeorm';
import { Images } from './images.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from 'src/auth/dto/jwt-payload';
import { Request } from 'express';

@Injectable()
export class ImagesService {
    s3Client: S3Client;

    constructor(
        @InjectRepository(Images)
        private ImagesRepository: Repository<Images>,
        private configService: ConfigService,
    ) {
        this.s3Client = new S3Client({
            region: this.configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')
            }
        })
    }

    async uploadImages (
        req: Request,
        file: Express.Multer.File,
        id: number
    ) {
        const {role} : JwtPayload = req["user"]

        if (role === 'user') {
                    throw new ForbiddenException({
                        message: "권한이 존재하지 않습니다."
                    })
                }

        const { size, mimetype, buffer, fieldname } = file;
        const type = ['image/png', 'image/jpeg', 'image/gif']
        const ext = path.extname(file.originalname);

        if (!type.some(i => i === mimetype)) {
            throw new UnsupportedMediaTypeException("png, jpg, gif 파일이 아닙니다.");
        }

        const fullName = `image-${fieldname}-${id}-${Date.now()}${ext}`
        const command = new PutObjectCommand({
            Bucket: this.configService.get('AWS_BUCKET_NAME'),
            Key: fullName,
            Body: buffer,
            ContentType: `image/${ext}`,
            ContentDisposition : "inline" // 다운로드가 아니라, 브라우저에서 표시하기 위함.
        })

        const result = await this.s3Client.send(command);
        
        if (result.$metadata.httpStatusCode === 200) {
            const data = {
                url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fullName}`,
                filename: fullName,
                size,
                mimetype
            }
            
            const { identifiers, generatedMaps } = await this.ImagesRepository.insert(data)
            
            return {identifiers, data, generatedMaps}
        } else {
            throw new NotFoundException(
                "업로드 할 사진이 없습니다."
            )
        }
    }

    async adminSaveImageUrl(urls : string[]) {
        const imageEntities : Images[] = urls.map((url) => ({
            url : url,
            filename : url,
            size : 0,
            mimetype : "image/jpg"
        }) as Images)

        const imageEntitiesResult = await this.ImagesRepository.save(imageEntities);

        return imageEntitiesResult;
    }
}

