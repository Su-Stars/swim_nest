import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateAccessDto {
  @IsNumber()
  @IsNotEmpty()
  sub : number;

  @IsEmail()
  @IsNotEmpty()
  email : string;

  @IsString()
  @IsNotEmpty()
  nickname : string;
}