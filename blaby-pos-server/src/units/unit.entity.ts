import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { ProductMaster } from "../product_master/product_master";

@Table({
  tableName: "unit",
})
export class unit extends Model<unit> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(50)) unit: string;
  @Column(DataType.INTEGER) adminId: number;
  @Column(DataType.INTEGER) companyid: number;
  @Column(DataType.STRING(100)) formalName: string;
  @Column(DataType.INTEGER) decimalValues: number;
  @Column(DataType.BOOLEAN) isDeleted: boolean;

  @CreatedAt
  @Column({ field: "createdat" })
  create_at: Date;
  @UpdatedAt
  @Column({ field: "updatedat" })
  updated_At: Date;

  @HasMany(() => ProductMaster)
  productMaster: ProductMaster[];
}
