import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from '../product_category_entity';
import { CategoryType } from './product_category_create';

export class ProductCategoryDto {
  @ApiProperty()
  readonly id: number;
  @ApiProperty()
  readonly category: string;
  @ApiProperty()
  readonly categoryType: CategoryType;
  @ApiProperty()
  readonly userid: number;
  @ApiProperty()
  readonly companyid: number;
  @ApiProperty()
  readonly isDeleted: boolean;
  @ApiProperty()
  readonly createdAt: Date;
  @ApiProperty()
  readonly updatedAt: Date;
  constructor(temp: ProductCategory) {
    this.id = temp.id;
    this.category = temp.category;
    this.categoryType = temp.categoryType;
    this.userid = temp.userid;
    this.companyid = temp.companyid;
    this.isDeleted = temp.isDeleted;
    this.createdAt = temp.create_at;
    this.updatedAt = temp.updatedAt;
  }
}
