import { IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class GetReviewQueryDto {
  @IsOptional()
  @Transform(({value}) => parseInt(value))
  limit : number = 20;

  @IsOptional()
  @Transform(({value}) => parseInt(value))
  page : number = 1;
}