import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { staffTransaction } from "../../shared/constants/constants";

export class CreateDto {
  @ApiProperty()
  @IsNumber()
  readonly adminid: number;

  @ApiProperty()
  @IsNumber()
  readonly companyid: number;

  @ApiProperty()
  readonly ledger: string;

  @ApiProperty()
  readonly ledgercategory: string;

  @ApiProperty()
  @IsEnum(staffTransaction)
  readonly type: staffTransaction;

  @ApiProperty()
  @IsString()
  readonly usertype: string;

  @ApiProperty()
  @IsNumber()
  readonly paid_amount: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly counterid: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly shiftid: number;

  @ApiProperty()
  @IsNumber()
  readonly total: number;

  @ApiProperty()
  @IsNumber()
  readonly outstanding: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly saleid: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly purchaseid: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly journalid: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly invoiceno: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly saletype: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly paymethod: string;

  @ApiProperty()
  @IsNumber()
  readonly staffid: number;

  @ApiProperty()
  @IsString()
  readonly status: string;

  @ApiProperty()
  @IsNumber()
  readonly paid_status: number;

  @ApiProperty()
  @IsString()
  readonly sdate: Date;
}
