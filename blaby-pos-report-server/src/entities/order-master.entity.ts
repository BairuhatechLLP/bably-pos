import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { CompanyMaster } from './company-master.entity';
import { OrderItems } from './order-items.entity';

@Table({
  tableName: 'order_master',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class OrderMaster extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  orderNumber: string;

  @ForeignKey(() => CompanyMaster)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  companyId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  adminId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  total: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  discount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  tax: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  grandTotal: number;

  @Column({
    type: DataType.STRING,
    defaultValue: 'pending',
  })
  orderStatus: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  customerName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  customerPhone: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentMethod: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @BelongsTo(() => CompanyMaster)
  CompanyMaster: CompanyMaster;

  @HasMany(() => OrderItems)
  orderItems: OrderItems[];
}
