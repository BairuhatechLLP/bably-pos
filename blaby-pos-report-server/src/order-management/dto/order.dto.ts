import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @Type(() => Number)
  @IsInt()
  productId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sp_price: number;

  @IsString()
  @IsOptional()
  idescription?: string;

  @IsString()
  @IsOptional()
  comb_id?: string;

  @IsString()
  @IsOptional()
  parcel_option?: string;

  @IsString()
  @IsOptional()
  ice_option?: string;

  @IsString()
  @IsOptional()
  sugar_option?: string;
}

export class CreateOrderDto {
  // Optional: server resolves the correct admin id for this branch
  // (the same id POS uses, so token sequences stay continuous).
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  adminId?: number;

  // Narration is optional. Allowed to be empty string or omitted entirely.
  @IsString()
  @IsOptional()
  cooking_instructions?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  staffId?: number;

  @IsBoolean()
  @IsOptional()
  ac_room?: boolean;
}

export class UpdateOrderDto extends CreateOrderDto {}

export class OrderQueryDto {
  @Type(() => Number)
  @IsInt()
  branchId: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  days?: number;
}

export class OrderBranchOnlyQueryDto {
  @Type(() => Number)
  @IsInt()
  branchId: number;
}
