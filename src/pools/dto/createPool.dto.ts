import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class createPool {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsOptional()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    website: string;

    @IsOptional()
    @IsString()
    freeSwimLink: string;

    @IsOptional()
    @IsString()
    swimLessonLink: string;

    @IsOptional()
    @IsString()
    laneInfo: string;

    @IsOptional()
    @IsString()
    depthInfo: string;

    @IsOptional()
    @IsBoolean()
    isSoapProvided: boolean;

    @IsOptional()
    @IsBoolean()
    isTowelProvided: boolean;

    @IsOptional()
    @IsBoolean()
    isKickboardAllowed: boolean;

    @IsOptional()
    @IsBoolean()
    isFinsAllowed: boolean;

    @IsOptional()
    @IsBoolean()
    isKickboardRental: boolean;

    @IsOptional()
    @IsBoolean()
    isDivingAllowed: boolean;

    @IsOptional()
    @IsBoolean()
    isPhotoAllowed: boolean;

    @IsOptional()
    @IsString()
    description: string;
}
