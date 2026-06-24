import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  idescription: string;

  @IsString()
  @IsOptional()
  icode?: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  sp_price: number;

  // Category field - either product_category or categoryId must be provided
  @ValidateIf((o) => !o.categoryId)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  product_category?: number;

  // Backward compatibility alias - either product_category or categoryId must be provided
  @ValidateIf((o) => !o.product_category)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  // Optional fields
  @IsString()
  @IsOptional()
  barcode?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsString()
  @IsOptional()
  pimage?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  active?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  adminid?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  userid?: number;

  @IsString()
  @IsOptional()
  itemtype?: string;
}
