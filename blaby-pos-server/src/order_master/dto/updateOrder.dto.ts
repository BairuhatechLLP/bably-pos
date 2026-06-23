import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
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
    enum: ["normal", "without", "with","extra"],
    required: false,
  })
  @IsString()
  @IsIn(["normal", "without", "with","extra"])
  @IsOptional()
  ice_option: string;

  @ApiProperty({
    description: "Sugar option",
    enum: ["normal", "without", "with","extra"],
    required: false,
  })
  @IsString()
  @IsIn(["normal", "without", "with","extra"])
  @IsOptional()
  sugar_option: string;
}
export class UpdateOrderByStatusDto {
  @ApiProperty()
  @IsNumber()
  readonly id: number;

  @ApiProperty()
  @IsOptional()
  readonly items?: any[];

  @ApiProperty()
  @IsIn(["cancelled", "started", "finished", "billed", "served","pending"], {
    message: "Invalid Order Status",
  })
  readonly orderStatus: string;
}
export class UpdateOrderDto {
  @ApiProperty()
  @IsNumber()
  readonly id: number;

  @ApiProperty()
  @IsNumber()
  readonly companyId: number;

  @ApiProperty()
  @IsOptional()
  readonly customerId: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly ac_room: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly shift_id: number;

  @ApiProperty()
  @IsOptional()
  readonly total: number;

  @ApiProperty()
  @IsOptional()
  readonly table_id: number;

  @ApiProperty()
  @IsOptional()
  readonly cooking_instructions: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly customerCount: number;

  @ApiProperty({
    type: [UpdateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  @IsOptional()
  orderItems: UpdateOrderItemDto[];
}
