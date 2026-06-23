import { ApiProperty } from "@nestjs/swagger";
import { ProductLocationMaster } from "../product_location.entity";

export class ProductLocationMasterDto {
  @ApiProperty()readonly id: number;
  @ApiProperty() readonly productName: string; 
  @ApiProperty() readonly productId: number;
  @ApiProperty() readonly locationId: number; 
  @ApiProperty() readonly locationName: string;
  @ApiProperty() readonly stock: number;
  @ApiProperty() readonly adminid: number;
  @ApiProperty() readonly companyid: number;
  @ApiProperty() readonly is_deleted: boolean;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  constructor(tmp: ProductLocationMaster) {
    this.id = tmp.id;
    this.productName = tmp.productName;
    this.productId = tmp.productId;
    this.locationId = tmp.locationId;
    this.locationName = tmp.locationName;
    this.stock = tmp.stock;
    this.adminid = tmp.adminid;
    this.companyid = tmp.companyid;
    this.createdAt = tmp.created_at;
    this.updatedAt = tmp.updated_at;
  }
}
