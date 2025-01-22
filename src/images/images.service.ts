import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ForbiddenException, Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
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
        file: Express.Multer.File
    ) {
        const {role} : JwtPayload = req["user"]

        if (role === 'user') {
                    throw new ForbiddenException({
                        message: "권한이 존재하지 않습니다."
                    })
                }

        const { size, mimetype, buffer } = file;
        const type = ['image/png', 'image/jpeg', 'image/gif']
        const ext = path.extname(file.originalname);

        // 임시 방편
        const placeId = Math.floor(Math.random()*10);

        if (!type.some(i => i === mimetype)) {
            throw new UnsupportedMediaTypeException("png, jpg, gif 파일이 아닙니다.");
        }

        const command = new PutObjectCommand({
            Bucket: this.configService.get('AWS_BUCKET_NAME'),
            Key: `image-${placeId}${ext}`,
            Body: buffer,
            ContentType: `image/${ext}`
        })

        const result = await this.s3Client.send(command);

        if (result.$metadata.httpStatusCode === 200) {
            const data = {
                url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/image-${placeId}${ext}`,
                filename: `image-${placeId}${ext}`,
                size,
                mimetype
            }
            
            const { identifiers } = await this.ImagesRepository.insert(data)

            const Result = await this.ImagesRepository.createQueryBuilder('images')
                .select([
                    'images.url AS imageUrl',
                    'images.filename AS fileName',
                    'images.size AS fileSize',
                    'images.mimetype AS mimeType',
                    'images.uploaded_at AS uploadedAt'
                ])
                .where('images.id = :id', {id: identifiers[0].id})
                .getRawMany();
                
            return {
                status: "success",
                message: "이미지 업로드에 성공했습니다.",
                data: Result
            }
        }
    }

    
}

