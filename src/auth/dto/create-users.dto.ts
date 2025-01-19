import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUsersDto {
  @IsEmail()
  @ApiProperty()
  email : string;

  @IsString()
  @ApiProperty()
  password : string;

  @IsString()
  @ApiProperty()
  nickname : string;

  @IsOptional()
  @ApiProperty()
  description : string;

  @IsOptional()
  @ApiProperty({
    description : "이미지 경로 - S3 경로"
  })
  image : string;
}