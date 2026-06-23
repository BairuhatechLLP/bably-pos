import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRetailCustomerDto {
  @ApiProperty()
  @IsNumber()
  readonly companyid: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly outstanding: number;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly card_number: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly phonenumber: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly email: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly status: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly refferalId: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly refferalPoint: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly loyaltyPoint: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly refferalCode: number;
}
