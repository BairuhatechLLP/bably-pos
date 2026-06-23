import { ApiProperty } from "@nestjs/swagger";

export class CreatePlanDto {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly company: number;

  @ApiProperty()
  readonly counter: number;

  @ApiProperty()
  readonly retailXpressWithTaxgo: number;

  @ApiProperty()
  readonly soleTrader: number;

  @ApiProperty()
  readonly period: number;

  @ApiProperty()
  readonly currencyCode: string;
}