
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class ExcelExportDto {
  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsNumber()
  companyId: number;

  @ApiProperty({ description: 'User ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;
}

export class ProductExcelData {
  id: number;
  name: string;
  current_price: number;
  product_category: string;
  si_number: number;
  new_price?: number | string;
}

export class BulkPriceUpdateDto {
  @ApiProperty({ description: 'Company ID', example: 1 })
//   @IsNumber()
  companyId: number | string;
}

export interface ExcelPriceData {
  id: number;
  current_price: number;
  new_price?: number;
}