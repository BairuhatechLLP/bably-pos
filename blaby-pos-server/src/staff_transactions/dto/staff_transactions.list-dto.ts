import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
export class ListStaffTrancectionDto {
  @ApiProperty()
  @IsOptional()
  readonly sDate: string;
  @ApiProperty()
  @IsOptional()
  readonly lDate: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly query: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly status: string;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly staffid: number;
  @ApiProperty()
  @IsNumber()
  readonly companyid: number;
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly type: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly sdate: Date;
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly paymethod: string;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly page: number;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly take: number;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly shiftId: number;
}

export class TransactionListDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly sdate: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly edate: string;

  @ApiProperty({
    description: "Time period filter",
    enum: ["today", "yesterday", "week", "month"],
    example: "month",
  })
  @IsString()
  @IsOptional()
  @IsIn(["today", "yesterday", "week", "month"], {
    message: "period must be one of: today, yesterday, week, month",
  })
  readonly period: string;

  @ApiProperty()
  @IsString()
  readonly transactiontype: string;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  readonly companyId: number;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  readonly staffId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  readonly page: number;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  readonly take: number;
}
