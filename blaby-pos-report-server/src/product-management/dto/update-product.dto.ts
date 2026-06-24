import { IsString, IsOptional, IsNumber, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  idescription?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sp_price?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  costprice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rate?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  c_price?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @ValidateIf((o) => !o.categoryId)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  product_category?: number;

  // Backward compatibility alias
  @ValidateIf((o) => !o.product_category)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

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

  @IsString()
  @IsOptional()
  icode?: string;
}
