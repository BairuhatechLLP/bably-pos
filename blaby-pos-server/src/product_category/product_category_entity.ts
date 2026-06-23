import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { CategoryType } from "./dto/product_category_create";

@Table({
  tableName: "product_category",
})
export class ProductCategory extends Model<ProductCategory> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(50)) category: string;
  @Column(DataType.STRING(50)) alias_name: string;
  @Column(DataType.STRING(50)) id_short: string;

  @Column(DataType.ENUM(...Object.values(CategoryType)))
  categoryType: CategoryType;
  @Column(DataType.INTEGER) userid: number;
  @Column(DataType.INTEGER) companyid: number;
  @Column(DataType.INTEGER) display_id: number;
  @Column(DataType.BOOLEAN) is_show_in_report: boolean;
  @Column(DataType.BOOLEAN) isDeleted: boolean;

  @CreatedAt
  @Column({ field: "createdat" })
  create_at: Date;
  @UpdatedAt
  @Column({ field: "updatedat" })
  updated_At: Date;
}
