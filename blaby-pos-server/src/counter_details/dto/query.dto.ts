import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { Transform } from "class-transformer";

export class Data {
    @ApiProperty()
    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    companyId: number;

    @ApiProperty()
    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    staffId: number;
}