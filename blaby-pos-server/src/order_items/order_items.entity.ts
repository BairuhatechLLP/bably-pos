import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsIn,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { OrderMaster } from "../order_master/order_master.entity";
import { ProductMaster } from "../product_master/product_master";

@Table({
  tableName: "order_items",
})
export class OrderItems extends Model<OrderItems> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => OrderMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  orderId: number;

  @ForeignKey(() => ProductMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  productId: number;

  @Column(DataType.STRING)
  comb_id: string;

  @Column(DataType.STRING)
  idescription: string;

  @Column(DataType.BIGINT)
  sp_price: number;

  @Column(DataType.BIGINT)
  quantity: number;

  @Column(DataType.BIGINT)
  companyId: number;

  @IsIn({
    msg: "Invalid Order Status",
    args: [["pending", "cancelled", "started", "finished", "served", "billed"]],
  })
  @Column({
    type: DataType.STRING,
    defaultValue: "pending",
  })
  orderStatus: string;

  @IsIn({
    msg: "Invalid Parcel Option",
    args: [["parcel", "dine-in", "delivery"]],
  })
  @Column({
    type: DataType.STRING,
    defaultValue: "dine-in",
  })
  parcel_option: string;

  @IsIn({
    msg: "Invalid Ice Option",
    args: [["normal", "without", "with", "extra"]],
  })
  @Column({
    type: DataType.STRING,
    defaultValue: "normal",
  })
  ice_option: string;

  @IsIn({
    msg: "Invalid Sugar Option",
    args: [["normal", "without", "with", "extra"]],
  })
  @Column({
    type: DataType.STRING,
    defaultValue: "normal",
  })
  sugar_option: string;

  @BelongsTo(() => ProductMaster)
  productMaster: ProductMaster;

  @BelongsTo(() => OrderMaster)
  OrderMaster: OrderMaster;
}
