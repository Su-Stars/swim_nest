import { IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class GetAllBulletinDto {
  @IsOptional()
  @Transform(({value}) => parseInt(value))
  page : number = 1;

  @IsOptional()
  @Transform(({value}) => parseInt(value))
  limit : number = 10;
}