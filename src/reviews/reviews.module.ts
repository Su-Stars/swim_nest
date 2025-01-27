import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Keyword, Review_Keywords, Reviews } from './reviews.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Pools } from 'src/pools/pools.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reviews, Keyword, Review_Keywords, Pools]),
    AuthModule
  ],
  providers: [ReviewsService],
  exports: [
    ReviewsModule,
    TypeOrmModule,
  ]
})
export class ReviewsModule {}
