import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class AdminSearchSwimLogsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  year : number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  month : number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  day : number;
}