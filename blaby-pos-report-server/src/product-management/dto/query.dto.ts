import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductManagementQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  adminid?: number;
}
