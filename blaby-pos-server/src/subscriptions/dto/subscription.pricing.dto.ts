import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class GetPricingDto {
  @ApiPropertyOptional({ minimum: 0, maximum: 50, default: 0 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly company: number = 0;

  @ApiPropertyOptional({ minimum: 0, maximum: 50, default: 0 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly counter: number = 0;

  @ApiPropertyOptional({ default: false })
  @Transform(
    ({ value }: TransformFnParams) => {
      if (value === "true") {
        return true;
      } else {
        return false;
      }
    },
    { toClassOnly: true }
  )
  @IsBoolean()
  @IsOptional()
  readonly retailXpressWithTaxgo: boolean = false;

  @ApiPropertyOptional({ default: false })
  @Transform(
    ({ value }: TransformFnParams) => {
      if (value === "true") {
        return true;
      } else {
        return false;
      }
    },
    { toClassOnly: true }
  )
  @IsBoolean()
  @IsOptional()
  readonly soleTrader: boolean = false;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 12, 24])
  @IsOptional()
  readonly period: number = 1;

  @ApiPropertyOptional({ default: "usd" })
  @IsString()
  @IsOptional()
  readonly currencyCode: string ;

  @ApiPropertyOptional({ default: false })
  @Transform(
    ({ value }: TransformFnParams) => {
      if (value === "true") {
        return true;
      } else {
        return false;
      }
    },
    { toClassOnly: true }
  )
  @IsOptional()
  @IsBoolean()
  readonly addon: boolean = false;
}
