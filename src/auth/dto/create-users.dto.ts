import { IsEmail, IsNumber, IsString } from "class-validator";
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
  username : string;

}