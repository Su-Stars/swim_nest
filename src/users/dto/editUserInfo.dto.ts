import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

// 아래의 정보는 있을 수도 있고, 없을 수도 있다.
export class EditUserInfoDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  nickname : string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description : string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  role : string;
}