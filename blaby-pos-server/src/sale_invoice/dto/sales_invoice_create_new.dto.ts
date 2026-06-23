import { ApiProperty } from "@nestjs/swagger";
import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsNotEmpty,
} from "class-validator";

export class StaffTransactionDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  adminid: number;

  @ApiProperty()
  @IsNumber()
  companyid: number;

  @ApiProperty()
  @IsString()
  ledger: string;

  @ApiProperty()
  @IsString()
  ledgercategory: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  usertype: string;

  @ApiProperty()
  @IsString()
  paid_amount: string;

  @ApiProperty()
  @IsString()
  total: string;

  @ApiProperty()
  @IsString()
  outstanding: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  saleid?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  customerid?: number;

  @ApiProperty()
  @IsNumber()
  shiftid: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  purchaseid?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  journalid?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  invoiceno?: string;

  @ApiProperty()
  @IsString()
  saletype: string;

  @ApiProperty()
  @IsString()
  paymethod: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  overall_parcel_charge?: string;

  @ApiProperty()
  @IsNumber()
  staffid: number;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsNumber()
  paid_status: number;

  @ApiProperty()
  @IsDateString()
  sdate: string;

  @ApiProperty()
  @IsNumber()
  counterid: number;

  @ApiProperty()
  @IsNumber()
  order_id: number;

  @ApiProperty()
  @IsDateString()
  createdat: string;

  @ApiProperty()
  @IsDateString()
  updatedat: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  customer_name?: string;
}

export class CloseShiftDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  staffTransactions: StaffTransactionDto[];

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  bankid?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paidmethod: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  companyid: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  staffId: number;
}
