import { ApiProperty } from '@nestjs/swagger';
import {
  Length,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDate,
} from 'class-validator';

export class UpdateLedgerDetailsDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly baseid: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly credit: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly debit: number;
  @IsOptional() @ApiProperty() @IsString() readonly type: string;
  @IsOptional() @ApiProperty() @IsString() readonly bankid: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly ledger: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly ledgercategory: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly saleid: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly purchaseid: number;
  @IsOptional() @ApiProperty() @IsString() readonly journalid: string;
  @IsOptional() @ApiProperty() @IsString() readonly invoiceid: string;
  @IsOptional() @ApiProperty() @IsString() readonly receiptid: string;
  @IsOptional() @ApiProperty() @IsString() readonly otherid: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly userid: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly adminid: number;
  @IsOptional() @ApiProperty() @IsString() readonly total: number;
  @IsOptional() @ApiProperty() @IsString() readonly invoiceno: string;
  @IsOptional() @ApiProperty() @IsString() readonly userdate: string;
  @IsOptional() @ApiProperty() @IsString() readonly cname: string;
  @IsOptional() @ApiProperty() @IsString() readonly customer_name: string;
  @IsOptional() @ApiProperty() @IsString() readonly idescription: string;
  @IsOptional() @ApiProperty() @IsString() readonly sdate: string;
  @IsOptional() @ApiProperty() @IsDate() readonly ldate: Date;
  @IsOptional() @ApiProperty() @IsNumber() readonly totalamount: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly outstanding: number;
  @IsOptional() @ApiProperty() @IsString() readonly status: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly discount_status: number;
  @IsOptional() @ApiProperty() @IsString() readonly reference: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly usedamount: number;
  @IsOptional() @ApiProperty() @IsString() readonly transferid: string;
  @IsOptional() @ApiProperty() @IsString() readonly paidmethod: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly amount: number;
  @IsOptional() @ApiProperty() @IsString() readonly paidfrom: string;
  @IsOptional() @ApiProperty() @IsString() readonly details: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly checked: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly discount: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly incomeTax: number;
  @IsOptional() @ApiProperty() @IsString() readonly description: string;
  @IsOptional() @ApiProperty() @IsString() readonly referenceid: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly reconcile_status: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly reconcileid: number;
  @IsOptional() @ApiProperty() @IsString() readonly reconcile_date: string;
  @IsOptional() @ApiProperty() @IsString() readonly used: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly booleantype: number;
  @IsOptional() @ApiProperty() @IsString() readonly usertype: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly costprice: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly quantity: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly percentage: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly incomeTaxAmount: number;
  @IsOptional() @ApiProperty() @IsString() readonly priceType: string;
  @IsOptional() @ApiProperty() @IsString() readonly invoiceimage: string;
  @IsOptional() @ApiProperty() @IsString() readonly invoicedoc: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly vat: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly vatamt: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly totalamt: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly includevat: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly showVat: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly itemorder: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly running_total: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly payrollid: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly employeeid: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly createdBy: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly companyid: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly stockTransferId: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly seriesNo: number;
}
