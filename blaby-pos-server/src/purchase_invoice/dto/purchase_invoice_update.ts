import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";
 
export class UpdatePurchaseInvoiceDto {

    @ApiProperty() @IsNumber() readonly userid: number
    @ApiProperty() @IsNumber() readonly supplierid: number
    @ApiProperty() @IsString() readonly invoiceno: string
    @ApiProperty() @IsOptional() readonly total : number
    @ApiProperty() @IsNumber() @IsOptional() readonly outstanding : number
    @ApiProperty() @IsOptional() readonly sname : string
    @ApiProperty() @IsNumber() @IsOptional() readonly status : number
    @ApiProperty() @IsOptional() readonly type : string
    @ApiProperty() @IsNumber() @IsOptional() readonly adminid : number
    @ApiProperty() @IsOptional() readonly invoiceimage : Buffer
    @ApiProperty() @IsOptional() readonly invoicedoc : Buffer
    @ApiProperty() @IsOptional() readonly quotes : string
    @ApiProperty() @IsNumber() @IsOptional() readonly share : number
    @ApiProperty() @IsOptional() readonly sdate : Date
    @ApiProperty() @IsOptional() readonly ldate : Date
    @ApiProperty() @IsOptional() readonly userdate : Date
    @ApiProperty() @IsOptional() readonly purchase_ref : string
    @ApiProperty() @IsOptional() readonly usertype : string

    @ApiProperty() @IsNumber() @IsOptional() readonly createdBy : number;
    @ApiProperty() @IsNumber() @IsOptional() readonly companyid : number;
    @ApiProperty() @IsNumber() @IsOptional() readonly seriesNo : number;

}