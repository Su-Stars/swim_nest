import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class createReviews {
    @IsNotEmpty()
    @IsString()
    content: string;

    @IsOptional()
    @IsArray()
    keyword: string[] = [];
}
