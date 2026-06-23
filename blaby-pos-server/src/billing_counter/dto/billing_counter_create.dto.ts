import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBillCounterDto {
    @ApiProperty()
    @IsNumber()
    readonly adminid: number;

    @ApiProperty()
    @IsNumber()
    readonly companyid: number;

    @ApiProperty()
    @IsNumber()
    readonly location: number;;

    @ApiProperty()
    @IsString()
    readonly name: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    readonly balance: number;

    @ApiProperty()
    readonly sdate: Date;

    @ApiProperty()
    readonly shiftlist: object;
}