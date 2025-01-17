import { Expose } from "class-transformer";
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
    @Expose({name: "freeSwimLink"})
    free_swim_link: string;

    @IsOptional()
    @Expose({name: "swimLessonLink"})
    swim_lesson_link: string;

    @IsOptional()
    @Expose({name: "laneInfo"})
    lane_info: string;

    @IsOptional()
    @Expose({name: "depthInfo"})
    depth_info: string;

    @IsOptional()
    @IsBoolean()
    @Expose({name: "isSoapProvided"})
    is_soap_provided: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({name: "isTowelProvided"})
    is_towel_provided: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({name: "isKickboardAllowed"})
    is_kickboard_allowed: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({name: "isFinsAllowed"})
    is_fins_allowed: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({name: "isKickboardRental"})
    is_kickboard_rental: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({name: "isDivingAllowed"})
    is_diving_allowed: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({name: "isPhotoAllowed"})
    is_photo_allowed: boolean;

    @IsOptional()
    description: string;
}
