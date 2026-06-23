import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UpdateSubscriptionsDto {
  @ApiProperty()
  @IsOptional()
  readonly company: number;

  @ApiProperty()
  @IsOptional()
  readonly counter: number;

  @ApiProperty()
  @IsOptional()
  readonly retailXpressWithTaxgo: boolean;

  @ApiProperty()
  @IsOptional()
  readonly soleTrader: boolean;
}