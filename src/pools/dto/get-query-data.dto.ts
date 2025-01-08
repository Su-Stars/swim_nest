import { IsInt, IsOptional } from "class-validator";

export class GetQueryData {
    @IsOptional()
    region: string = 'all';

    @IsOptional()
    @IsInt()
    page: number = 1;

    @IsOptional()
    @IsInt()
    limit: number = 10;
}