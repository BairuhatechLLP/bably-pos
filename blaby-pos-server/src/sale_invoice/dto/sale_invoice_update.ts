import { ApiProperty } from '@nestjs/swagger';
import {
  Length,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDate,
} from 'class-validator';

export class UpdateSalesInvoiceDto {
  @ApiProperty() @IsString() readonly cname: string;
  @ApiProperty() @IsString() readonly inaddress: string;
  @ApiProperty() @IsString() readonly deladdress: string;
  @ApiProperty() @IsNumber() readonly userid: number;
  @ApiProperty() readonly customerid: number;
  @ApiProperty() readonly issued: string;
  @ApiProperty() @IsString() readonly invoiceno: string;
  @ApiProperty() @IsString() readonly type: string;
  @ApiProperty() readonly attachment: string;
  @ApiProperty() @IsString() readonly quotes: string;
  @ApiProperty() @IsString() readonly terms: string;
  @ApiProperty() readonly reference: string;
  @ApiProperty() readonly usertype: string;

  @ApiProperty() readonly userdate: Date;
  @ApiProperty() readonly sdate: Date;
  @ApiProperty() readonly ldate: Date;
  @ApiProperty() @IsNumber() readonly total: number;
  @ApiProperty() readonly outstanding: number;
  @ApiProperty() readonly status: number;
  @ApiProperty() @IsNumber() readonly adminid: number;
  @ApiProperty() readonly share: number;
  @ApiProperty() readonly columns: any[];
  @ApiProperty() readonly refid: number;
  @ApiProperty() readonly paymentInfo: any;
  @ApiProperty() readonly paymentdate: Date;
  @ApiProperty() readonly salesType: string;
  @ApiProperty() @IsNumber() readonly createdBy: number;
  @ApiProperty() @IsNumber() readonly companyid: number;
  @ApiProperty() readonly loyaltyDiscountAmount: number;
  @ApiProperty() readonly seriesNo: number;
}
