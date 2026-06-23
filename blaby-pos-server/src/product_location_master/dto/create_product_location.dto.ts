import { ApiProperty } from "@nestjs/swagger";

export class CreateProductLocationDto {
  @ApiProperty() readonly productName: string; 
  @ApiProperty() readonly productId: number;
  @ApiProperty() readonly locationId: number; 
  @ApiProperty() readonly locationName: string;
  @ApiProperty() readonly stock: number;
  @ApiProperty() readonly adminid: number;
  @ApiProperty() readonly companyid: number;
  @ApiProperty() readonly is_deleted: boolean;
}
