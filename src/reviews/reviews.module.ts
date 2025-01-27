import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Keyword, Review_Keywords, Reviews } from './reviews.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reviews, Keyword, Review_Keywords])
  ],
  providers: [ReviewsService],
  exports: [
    ReviewsModule,
    TypeOrmModule,
  ]
})
export class ReviewsModule {}
