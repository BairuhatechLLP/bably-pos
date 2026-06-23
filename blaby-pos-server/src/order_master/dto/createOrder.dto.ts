import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";
export class OrderItemDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty()
  @IsNumber()
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
    description: "Ice option",
    enum: ["normal", "without", "with","extra"],
    required: false,
  })
  @IsString()
  @IsIn(["normal", "without", "with","extra"])
  @IsOptional()
  ice_option: string;

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
    description: "Sugar option",
    enum: ["normal", "without", "with","extra"],
    required: false,
  })
  @IsString()
  @IsIn(["normal", "without", "with","extra"])
  @IsOptional()
  sugar_option: string;
}
export class CreateOrderDto {
  @ApiProperty()
  @IsOptional()
  readonly customerId: number;

  @ApiProperty()
  @IsNumber()
  readonly companyId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly tokenNo: string;

  @ApiProperty()
  @IsNumber()
  readonly staffId: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly ac_room: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly shift_id: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly customerCount: number;

  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  @IsOptional()
  readonly cooking_instructions: string;

  @ApiProperty()
  @IsOptional()
  @IsIn(
    ["all", "pending", "cancelled", "started", "finished", "served", "billed"],
    {
      message: "invalid status",
    }
  )
  @Transform(({ value }) => (value === undefined ? "pending" : value))
  readonly orderStatus: string;

  @ApiProperty()
  @IsNumber()
  utcOffset: number;

  @ApiProperty({
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
}
export type OrderItems = {
  readonly orderId: number;
  readonly productId: number;
  readonly quantity: number;
  readonly dine_in_quantity: number;
  readonly parcel_quantity: number;
  readonly is_parcel: boolean;
  readonly orderStatus: string;
};
