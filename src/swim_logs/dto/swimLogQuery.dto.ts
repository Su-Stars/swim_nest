import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

// 연도(4자리) 와 월(1~12) 는 필수. 그리고 날짜는 선택(1 ~ 31)
export class SwimLogQueryDto {
  @ApiProperty()
  @IsNotEmpty()
  year : number;

  @ApiProperty()
  @IsNotEmpty()
  month : number;

  @ApiProperty()
  @IsOptional()
  day : number;
}