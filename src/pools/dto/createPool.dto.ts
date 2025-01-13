import { IsOptional } from "class-validator";

export class createPool {
    name: string;

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
    isSoapProvided: boolean;

    @IsOptional()
    isTowelProvided: boolean;

    @IsOptional()
    isKickboardAllowed: boolean;

    @IsOptional()
    isFinsAllowed: boolean;

    @IsOptional()
    isKickboardRental: boolean;

    @IsOptional()
    isDivingAllowed: boolean;

    @IsOptional()
    isPhotoAllowed: boolean;

    @IsOptional()
    description: string;
}