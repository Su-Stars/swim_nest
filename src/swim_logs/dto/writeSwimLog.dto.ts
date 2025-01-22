import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class WriteSwimLogDto {
  @ApiProperty({
    type : "string",
    examples : ["2024-10-30", "2025-01-01"],
    description : "필수 - 기록 일자 (연도-월-일)"
  })
  @IsString()
  @IsNotEmpty()
  swim_date : string;

  @ApiProperty({
    type : "string",
    examples : ["14:30"],
    description : "선택적 - 수영 시작 시간 (24시간제)"
  })
  @IsString()
  @IsOptional()
  start_time : string;

  @ApiProperty({
    type : "string",
    examples : ["15:30"],
    description : "선택적 - 수영 종료 시간 (24시간제)"
  })
  @IsString()
  @IsOptional()
  end_time : string;

  @ApiProperty({
    type : "number",
    examples : [25, 50],
    description : "선택적 - 수영장 길이"
  })
  @IsNumber()
  @IsOptional()
  lane_length : number;

  @ApiProperty({
    type : "number",
    examples : [100, 150, 125, 300, 500],
    description : "필수 - 해당 영법으로 수영 한 길이"
  })
  @IsNumber()
  @IsNotEmpty()
  swim_length : number;

  @ApiProperty({
    type : "string",
    examples : ["자유형", "배영", "평영", "접영", "기타"],
    description : "선택적 - 입력 없을 시, 자동으로 '자유형' 으로 입력됩니다."
  })
  @IsString()
  @IsOptional()
  swim_category = "자유형";

  @ApiProperty({
    type : "string",
    examples : ["오늘은 참 열심히 했다", "접영 능력이 부족한 것 같다", "근육이 뭉친 것 같다"],
    description : "선택적 - 글을 기록 할 수도 있고, 수영 기록만 남길 수도 있으므로 선택으로 남겼습니다"
  })
  @IsString()
  @IsOptional()
  note : string;
}