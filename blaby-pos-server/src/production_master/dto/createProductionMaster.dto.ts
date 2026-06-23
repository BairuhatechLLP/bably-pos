import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";
export class CreateProductionItemsDto {
  @ApiProperty()
  @IsNumber()
  readonly productId: number;

  @ApiProperty()
  @IsNumber()
  readonly batchQuantity: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  readonly unitCostPrice: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  readonly unitSalesPrice: number;
}
export class CreateExpenseLedgerItemsDto {
  @ApiProperty()
  @IsNumber()
  readonly ledgerId: number;

  @ApiProperty()
  @IsNumber()
  readonly amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly notes: string;
}
export class CreateProductionMasterDto {
  @ApiProperty()
  @IsNumber()
  readonly companyId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly staffId: number;

  @ApiProperty()
  @IsIn(["admin", "staff"], {
    message: "Invalid User Type",
  })
  readonly createdBy: string;

  @ApiProperty()
  @IsNumber()
  readonly bomId: number;

  @ApiProperty()
  @IsNumber()
  readonly productId: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  readonly batchQuantity: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  readonly productionQuantity: number;

  @ApiProperty()
  @IsNumber()
  readonly consumptionLocationId: number;

  @ApiProperty()
  @IsNumber()
  readonly productionLocationId: number;

  @ApiProperty({
    type: [CreateProductionItemsDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductionItemsDto)
  compositeProductionItems: CreateProductionItemsDto[];

  @ApiPropertyOptional({
    type: [CreateProductionItemsDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductionItemsDto)
  @IsOptional()
  wastageProductionItems: CreateProductionItemsDto[];

  @ApiPropertyOptional({
    type: [CreateExpenseLedgerItemsDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseLedgerItemsDto)
  @IsOptional()
  expenseLedgerItems: CreateExpenseLedgerItemsDto[];

  @ApiProperty({
    type: [CreateProductionItemsDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductionItemsDto)
  productProductionItems: CreateProductionItemsDto[];
}
