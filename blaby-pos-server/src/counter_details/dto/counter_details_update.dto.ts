import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class UpdateDto {
    @ApiProperty()
    @IsNumber()
    readonly id: number;

    @ApiProperty()
    @IsNumber()
    readonly companyid: number;

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
    readonly floatbalance: number;

    @ApiProperty()
    @IsNumber()
    readonly counter_id: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    readonly staffid: number;

    @ApiProperty()
    @IsOptional()
    readonly open_denomination: object;

    @ApiProperty()
    @IsOptional()
    readonly close_denomination: object;
}