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
import { ProductionMaster } from "../production_master/production_master.entity";
import { ProductMaster } from "../product_master/product_master";

@Table({
  tableName: "production_items",
})
export class ProductionItems extends Model<ProductionItems> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => ProductionMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  productionId: number;

  // @ForeignKey(() => ProductMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  productId: number;

  @Column(DataType.DOUBLE)
  batchQuantity: number;

  @Column(DataType.DOUBLE)
  productionQuantity: number;

  @Column(DataType.DOUBLE)
  unitCostPrice: number;

  @Column(DataType.DOUBLE)
  unitSalesPrice: number;

  @Column(DataType.DOUBLE)
  totalCostPrice: number;

  @IsIn({
    msg: "Invalid item Type",
    args: [["product", "wastage", "composite"]],
  })
  @Column(DataType.STRING)
  type: string;

  @BelongsTo(() => ProductionMaster)
  productionDetails: ProductionMaster;

  @BelongsTo(() => ProductMaster, {
    foreignKey: "productId",
    targetKey: "id",
    constraints: false,
  })
  productDetails: ProductMaster;

  @Column({
    type: DataType.VIRTUAL,
    get(this: ProductionItems) {
      return this.batchQuantity * this.productionQuantity;
    },
  })
  totalQuantity: number;
}
