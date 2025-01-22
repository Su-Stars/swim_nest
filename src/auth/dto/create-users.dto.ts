import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUsersDto {
  @IsEmail()
  @ApiProperty()
  email : string;

  @IsString()
  @ApiProperty()
  password : string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  nickname : string;

  @IsString()
  @IsOptional()
  role : string;

  @IsOptional()
  @ApiProperty()
  description : string;

  @IsOptional()
  @ApiProperty({
    description : "이미지 경로 - S3 경로"
  })
  image : string;
}