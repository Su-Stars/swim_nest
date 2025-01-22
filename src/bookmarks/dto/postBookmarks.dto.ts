import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class PostBookmarksDto {
  @ApiProperty()
  @IsNumber()
  poolId : number;
}