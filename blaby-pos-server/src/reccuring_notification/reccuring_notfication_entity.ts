import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { SaleInvoice } from '../sale_invoice/sale_invoice';
import { User } from '../users/user.entity';

@Table({ tableName: 'reccuring_notification' })
export class ReccuringNotification extends Model<ReccuringNotification> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userid?: number;
  @BelongsTo(() => User)
  user: User[];

  @ForeignKey(() => SaleInvoice)
  @Column(DataType.BIGINT)
  invoice_id?: number;
  @BelongsTo(() => SaleInvoice)
  invoiceDetails: SaleInvoice;

  @Column(DataType.STRING)
  invoice_number: string;

  @Column(DataType.STRING)
  period: string;

  @Column(DataType.DATE)
  date: Date;

  @Column(DataType.DATE)
  nextdate: Date;

  @Column(DataType.BOOLEAN)
  status: Boolean;

  @Column(DataType.INTEGER)
  companyid: number;

  @CreatedAt
  @Column({ field: 'createdat' })
  created_at: Date;

  @UpdatedAt
  @Column({ field: 'updatedat' })
  updated_at: Date;
}
