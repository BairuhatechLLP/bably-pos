import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { OrderMaster } from './order-master.entity';
import { ProductMaster } from './product-master.entity';

@Table({
  tableName: 'order_items',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false,
})
export class OrderItems extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => OrderMaster)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  orderId: number;

  @ForeignKey(() => ProductMaster)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  productId: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  productName: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'sp_price',
  })
  sp_price: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  subtotal: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  discount: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  orderStatus: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  companyId: number;

  @BelongsTo(() => ProductMaster, 'productId')
  productMaster: ProductMaster;

  @BelongsTo(() => OrderMaster)
  orderMaster: OrderMaster;
}
