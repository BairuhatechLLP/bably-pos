
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CategoryReportQueryDto {
  @ApiProperty({ required: true, description: "User admin ID" })
  @IsNumber()
  adminid: number;

  @ApiProperty({ required: false, description: "Specific Product Category ID (optional)" })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ required: false, description: "Category name to filter (e.g., 'Shawarma')" })
  @IsOptional()
  @IsString()
  categoryName?: string;

  @ApiProperty({ required: false, description: "Specific Company/Branch ID (optional)" })
  @IsOptional()
  @IsNumber()
  companyId?: number;

  @ApiProperty({ required: false, description: "Start date for filtering (YYYY-MM-DD)" })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false, description: "End date for filtering (YYYY-MM-DD)" })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class CategoryReportResponseDto {
  categoryId: number;
  categoryName: string;
  companies: CompanyCategoryData[];
  totalProducts: number;
  totalValue: number;
}

export class CompanyCategoryData {
  companyId: number;
  companyName: string;
  productCount: number;
  totalQuantitySold: number;
  totalSalesValue: number;
  totalInvoices: number;
  hasProducts: boolean;
  products: ProductSalesData[];
}

export class ProductSalesData {
  productId: number;
  productName: string;
  quantitySold: number;
  salesValue: number;
  numberOfInvoices: number;
  averagePrice: number;
}
