import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

export class UpdateOrderItemDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly id: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  productId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
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

  @ApiProperty({
    description: "Parcel option",
    enum: ["parcel", "dine-in", "delivery"],
    required: false,
  })
  @IsString()
  @IsIn(["parcel", "dine-in", "delivery"])
  @IsOptional()
  parcel_option: string;

  @ApiProperty({
    description: "Ice option",
    enum: ["normal", "without", "with", "extra"],
    required: false,
  })
  @IsString()
  @IsIn(["normal", "without", "with", "extra"])
  @IsOptional()
  ice_option: string;

  @ApiProperty({
    description: "Sugar option",
    enum: ["normal", "without", "with", "extra"],
    required: false,
  })
  @IsString()
  @IsIn(["normal", "without", "with", "extra"])
  @IsOptional()
  sugar_option: string;
}
