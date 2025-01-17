import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @ApiProperty()
  password : string;
}