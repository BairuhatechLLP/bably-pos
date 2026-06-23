import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsInt,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsOptional,
  IsString,
  IsIn,
} from "class-validator";

export class OrderItemDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  companyId: number;

  @ApiPropertyOptional()
  @IsOptional()
  sp_price: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comb_id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  idescription: string;

  @ApiPropertyOptional({
    description: "Parcel option",
    enum: ["parcel", "dine-in", "delivery"],
    default: "dine-in",
  })
  @IsString()
  @IsIn(["parcel", "dine-in", "delivery"])
  @IsOptional()
  parcel_option: string;

  @ApiProperty({
    description: "Ice option",
    enum: ["normal", "without", "with", "extra"],
    default: "normal",
  })
  @IsString()
  @IsIn(["normal", "without", "with", "extra"])
  @IsOptional()
  ice_option: string;

  @ApiProperty({
    description: "Sugar option",
    enum: ["normal", "without", "with", "extra"],
    default: "normal",
  })
  @IsString()
  @IsIn(["normal", "without", "with", "extra"])
  @IsOptional()
  sugar_option: string;
}
