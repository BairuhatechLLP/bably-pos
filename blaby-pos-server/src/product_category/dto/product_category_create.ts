import { ApiProperty } from "@nestjs/swagger";

export enum CategoryType {
  Product = "product",
  Service = "service",
}

export class CreateProductCategoryDto {
  @ApiProperty() readonly category: string;
  @ApiProperty() readonly categoryType: CategoryType;
  @ApiProperty() readonly userid: number;
  @ApiProperty() readonly companyid: number;
  @ApiProperty() readonly id_short: string;
}
