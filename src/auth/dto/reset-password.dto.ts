import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  password : string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  newPassword : string;
}