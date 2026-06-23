import { ApiProperty } from '@nestjs/swagger';
import { Length, IsString, IsOptional, IsBoolean, IsNumber, IsDate } from 'class-validator'; 

export class UpdateAccountMasterDto {
    @ApiProperty() readonly userid: number;

    @ApiProperty() @IsString() readonly nominalcode: string
    @ApiProperty() @IsString() readonly laccount: string
    @ApiProperty() readonly acctype: string

    @ApiProperty() accnum: string
    @ApiProperty() cardnum: string
    @ApiProperty() paidmethod: string
    @ApiProperty() sortcode1: string
    @ApiProperty() sortcode2: string
    @ApiProperty() sortcode3: string
    @ApiProperty() ibannum: string
    @ApiProperty() bicnum: string
    @ApiProperty() userdate: Date
    @ApiProperty() adminid: number
    @ApiProperty() opening: number
    @ApiProperty() total: number
    @ApiProperty() type: number
    @ApiProperty() category: number
    @ApiProperty() categorygroup: number
    @ApiProperty() visiblestatus: number
    @ApiProperty() visbank: number
    @ApiProperty() vissinvoice: number
    @ApiProperty() vispinvoice: number
    @ApiProperty() visotherreceipt: number
    @ApiProperty() visotherpayment: number
    @ApiProperty() visjournal: number
    @ApiProperty() visreport: number
    @ApiProperty() showVatRate: number
    @ApiProperty() calculationPeriod: number

    @ApiProperty() journals: number
    @ApiProperty() purchase: number
    @ApiProperty() sales: number
    @ApiProperty() createdBy: number
    @ApiProperty() companyid: number

    @ApiProperty() sdate: Date
    @ApiProperty() ldate: Date
    @ApiProperty() logintype: string

    @ApiProperty() branch: string
    @ApiProperty() ifsc: string
    @ApiProperty() accountname: string


}
