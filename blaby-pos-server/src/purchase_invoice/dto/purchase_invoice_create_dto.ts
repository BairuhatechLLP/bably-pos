import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePurhcaseInvoiceDto { 
  @ApiProperty() @IsNumber() readonly userid: number;
  @ApiProperty() @IsNumber() readonly supplierid: number;
  @ApiProperty() readonly quantity: number;
  @ApiProperty() readonly stockid: number;
  @ApiProperty() @IsString() readonly invoiceno: string;
  @ApiProperty() @IsNumber() @IsOptional() readonly total: number;
  @ApiProperty() @IsNumber() @IsOptional() readonly outstanding: number;
  @ApiProperty() @IsNumber() @IsOptional() readonly sname: string;
  @ApiProperty() @IsNumber() @IsOptional() readonly status: number;
  @ApiProperty() @IsNumber() @IsOptional() readonly type: string;
  @ApiProperty() @IsNumber() @IsOptional() readonly adminid: number;
  @ApiProperty() @IsOptional() readonly invoiceimage: Buffer;
  @ApiProperty() @IsOptional() readonly invoicedoc: Buffer;
  @ApiProperty() @IsOptional() readonly quotes: string;
  @ApiProperty() @IsOptional() readonly usertype: string;
  @ApiProperty() @IsNumber() @IsOptional() readonly share: number;
  @ApiProperty() @IsOptional() readonly sdate: Date;
  @ApiProperty() @IsOptional() readonly ldate: Date;
  @ApiProperty() @IsOptional() readonly userdate: Date;
  @ApiProperty() @IsOptional() readonly month: Date;
  @ApiProperty() @IsNumber() @IsOptional() readonly createdBy: number;
  @ApiProperty() @IsNumber() @IsOptional() readonly companyid: number;
  @ApiProperty() @IsNumber() @IsOptional() readonly seriesNo: number;
  @ApiProperty() @IsOptional() readonly purchase_ref: string;
}
