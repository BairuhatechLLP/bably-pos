import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateSubscriptionsDto {
  @ApiProperty()
  readonly userId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly company: number = 0;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly counter: number = 0;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  readonly retailXpressWithTaxgo: boolean = false;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  readonly soleTrader: boolean = false;

  @ApiProperty()
  @IsNumber()
  readonly period: number = 1;
}
