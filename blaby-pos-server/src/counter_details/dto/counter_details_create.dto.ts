import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateDto {
    @ApiProperty()
    @IsNumber()
    readonly adminid: number;

    @ApiProperty()
    @IsNumber()
    readonly companyid: number;

    @ApiProperty()
    @IsNumber()
    readonly counter_id: number;

    @ApiProperty()
    @IsNumber()
    readonly balance: number;

    @ApiProperty()
    @IsNumber()
    readonly short: number;

    @ApiProperty()
    @IsNumber()
    readonly closing_balance: number;

    @ApiProperty()
    @IsNumber()
    readonly staffid: number;

    @ApiProperty()
    readonly sdate: Date;

    @ApiProperty()
    readonly open_denomination: object;

    @ApiProperty()
    readonly close_denomination: object;

    @ApiProperty()
    @IsString()
    readonly shift_type: string;
}