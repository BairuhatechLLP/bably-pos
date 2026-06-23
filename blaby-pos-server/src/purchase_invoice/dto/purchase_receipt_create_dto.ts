import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsString, IsOptional } from "class-validator";

export class CreatePurhcaseReceiptDto {

    @ApiProperty() readonly userid: number
    @ApiProperty() readonly quantity: number;
    @ApiProperty() readonly stockid: number;
    @ApiProperty() @IsOptional() readonly userdate: Date
    @ApiProperty() @IsOptional() readonly sname: string
    @ApiProperty() @IsOptional() readonly sdate: Date
    @ApiProperty() readonly reference: number
    @ApiProperty() readonly receipttype: string
    @ApiProperty() @IsOptional() readonly paidto: number
    @ApiProperty() @IsOptional() readonly paidmethod: string
    @ApiProperty() @IsOptional() readonly adminid: number
    @ApiProperty() @IsOptional() readonly logintype: string

    @ApiProperty() @IsOptional() readonly amount: number
    @ApiProperty() @IsOptional() readonly item: any
}