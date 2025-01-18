import { IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class EmailVerificationDto {
  @IsEmail()
  @ApiProperty()
  email : string;
}