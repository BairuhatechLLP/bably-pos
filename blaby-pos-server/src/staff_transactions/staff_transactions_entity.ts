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
  UpdatedAt
} from "sequelize-typescript";
import { BillingCounter } from "../billing_counter/billing_counter_entity";
import { OrderMaster } from "../order_master/order_master.entity";
import { staffTransaction } from "../shared/constants/constants";

@Table({ tableName: "staff_transactions" })
export class StaffTransactions extends Model<StaffTransactions> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.BIGINT)
  adminid: number;

  @Column(DataType.BIGINT)
  companyid: number;

  @Column(DataType.STRING(100))
  ledger: string;

  @Column(DataType.STRING(100))
  ledgercategory: string;

  @Column(DataType.ENUM(...Object.values(staffTransaction)))
  type: staffTransaction;

  @Column(DataType.STRING(100))
  usertype: string;

  @Column(DataType.STRING(100))
  customer_name: string;

  @Column(DataType.DECIMAL(11, 2))
  paid_amount: number;

  @Column(DataType.DECIMAL(11, 2))
  total: number;

  @Column(DataType.DECIMAL(11, 2))
  outstanding: number;

  // @ForeignKey(() => SaleInvoice)
  @Column(DataType.BIGINT)
  saleid: number;
  // @BelongsTo(() => SaleInvoice)
  // SaleDetails: SaleInvoice;

  @Column(DataType.BIGINT)
  customerid: number;

  @Column(DataType.BIGINT)
  shiftid: number;

  @Column(DataType.BIGINT)
  purchaseid: number;

  @Column(DataType.STRING(100))
  journalid: string;

  @Column(DataType.STRING(100))
  invoiceno: string;

  @Column(DataType.STRING(100))
  saletype: string;

  @Column(DataType.STRING(100))
  paymethod: string;

  @Column(DataType.DECIMAL(20, 2)) overall_parcel_charge: number;

  @Column(DataType.BIGINT)
  staffid: number;

  @Column(DataType.STRING(100))
  status: string;

  @Column(DataType.BIGINT)
  paid_status: number;

  @Column(DataType.DATE)
  sdate: Date;

  @ForeignKey(() => BillingCounter)
  @Column(DataType.BIGINT)
  counterid: number;

  @ForeignKey(() => OrderMaster)
  @Column({ type: DataType.BIGINT, allowNull: true })
  order_id: number;

  @BelongsTo(() => BillingCounter)
  counterdetails: BillingCounter;

  @CreatedAt
  @Column({ field: "createdat" })
  created_at: Date;

  @UpdatedAt
  @Column({ field: "updatedat" })
  updated_at: Date;

  @BelongsTo(() => OrderMaster)
  orderDetails: OrderMaster;
}
