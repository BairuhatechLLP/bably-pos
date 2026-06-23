import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsIn,
  Min,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { ProductMaster } from "../product_master/product_master";
import { BomMaster } from "../bom_master/bom_master.entity";

@Table({
  tableName: "bom_items",
})
export class BomItems extends Model<BomItems> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => BomMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  bomId: number;

  @ForeignKey(() => ProductMaster)
  @Column({ type: DataType.BIGINT, allowNull: true })
  productId: number;

  @Min(0.001)
  @Column(DataType.INTEGER)
  quantity: number;

  @IsIn({
    msg: "Invalid BOM item type,only allow are Composite and Byproduct",
    args: [["composite", "byProduct"]],
  })
  @Column(DataType.STRING)
  type: string;

  @BelongsTo(() => BomMaster)
  BomMaster: BomMaster;

  @BelongsTo(() => ProductMaster, "productId")
  Product: ProductMaster;
}
