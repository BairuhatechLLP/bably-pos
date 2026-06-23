import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateRetailCustomer {
  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly outstanding: number;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly phonenumber: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly card_number: string;

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
}
