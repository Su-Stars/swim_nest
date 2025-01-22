import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class WriteSwimLogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  swim_date : string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  start_time : string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  end_time : string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  swim_length : number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  swim_category = "자유형";

  @ApiProperty()
  @IsString()
  @IsOptional()
  note : string;
}