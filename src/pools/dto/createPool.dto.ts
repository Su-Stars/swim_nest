import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator";

export class createPool {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    address: string;

    @IsOptional()
    phone: string;

    @IsOptional()
    website: string;

    @IsOptional()
    images: string;

    @IsOptional()
    freeSwimLink: string;

    @IsOptional()
    swimLessonLink: string;

    @IsOptional()
    laneInfo: string;

    @IsOptional()
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
    description: string;
}
