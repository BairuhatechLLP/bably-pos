import { ApiProperty } from '@nestjs/swagger';
import { Length, IsString, IsBoolean, IsNumber, IsDate, IsOptional } from 'class-validator';


export class CreateAccountMasterDto {
    @ApiProperty() readonly userid: number;

    @ApiProperty() 
    @IsOptional()
    nominalcode: string
    @ApiProperty() readonly laccount: string
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
    @ApiProperty() createdBy: number
    

    @ApiProperty() journals: string
    @ApiProperty() purchase: string
    @ApiProperty() sales: string
    @ApiProperty() branch: string
    @ApiProperty() ifsc: string
    @ApiProperty() companyid: number;
    @ApiProperty() accountname: string


    @ApiProperty() sdate: Date
    @ApiProperty() ldate: Date
    @ApiProperty() logintype: string
    id: any;


}