import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumber, IsPositive } from "class-validator";

export class ProductionItemsDto {
  @ApiProperty()
  @IsNumber()
  productionId: number;

  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  productionQuantity: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  batchQuantity: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  unitCostPrice: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  unitSalesPrice: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  totalCostPrice: number;

  @ApiProperty()
  @IsIn(["product", "wastage", "composite"], {
    message: "Invalid Production Items Type",
  })
  type: string;

  constructor(data: Partial<ProductionItemsDto>) {
    this.productionId = data.productionId;
    this.productId = data.productId;
    this.productionQuantity = data.productionQuantity;
    this.batchQuantity = data.batchQuantity;
    this.unitCostPrice = data.unitCostPrice;
    this.unitSalesPrice = data.unitSalesPrice;
    this.totalCostPrice = data.totalCostPrice;
    this.type = data.type;
  }
}
