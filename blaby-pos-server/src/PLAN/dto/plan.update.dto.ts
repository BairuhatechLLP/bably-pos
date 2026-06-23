import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UpdatePlanDto {
  @ApiProperty()
  @IsOptional()
  readonly name: string;

  @ApiProperty()
  @IsOptional()
  readonly company: number;

  @ApiProperty()
  @IsOptional()
  readonly counter: number;

  @ApiProperty()
  @IsOptional()
  readonly retailXpressWithTaxgo: number;

  @ApiProperty()
  @IsOptional()
  readonly soleTrader: number;

  @ApiProperty()
  @IsOptional()
  readonly period: number;

  @ApiProperty()
  @IsOptional()
  readonly currencyCode: string;
}