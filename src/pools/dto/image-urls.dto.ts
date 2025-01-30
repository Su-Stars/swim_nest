import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty } from "class-validator";

export class ImageUrls {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  imageUrls : string[] = [];
}