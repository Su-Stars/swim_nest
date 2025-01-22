import {  IsOptional, IsString } from "class-validator";

export class GetQueryData {
    @IsOptional()
    region: string = 'all';

    @IsOptional()
    page: number = 1;

    @IsOptional()
    limit: number = 10;

    @IsOptional()
    @IsString()
    keyword: string = 'all';
}