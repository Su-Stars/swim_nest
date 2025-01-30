import { ApiProperty, ApiQuery } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class MyReviewQueryDto {
  @ApiProperty()
  @IsOptional()
  @Transform(({value}) => parseInt(value))
  page : number = 1;

  @ApiProperty()
  @IsOptional()
  @Transform(({value}) => parseInt(value))
  limit : number = 20;
}