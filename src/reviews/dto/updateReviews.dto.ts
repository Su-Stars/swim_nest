import { IsArray, IsOptional, IsString } from "class-validator";

export class updateReviews {
    @IsOptional()
    @IsString()
    content: string = null;

    @IsOptional()
    @IsArray()
    keyword: string[] = [];
}