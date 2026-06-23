import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  IsIn,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { CompanyMaster } from "../company_master/company_master_entity";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { OrderItems } from "../order_items/order_items.entity";
import { User } from "../users/user.entity";
import { StaffTransactions } from "../staff_transactions/staff_transactions_entity";
import { DiningTable } from "../dining_table/dining_table.entity";

@Table({
  tableName: "order_master",
})
export class OrderMaster extends Model<OrderMaster> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => ContactMaster)
  @Column({ type: DataType.BIGINT, allowNull: true })
  customerId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  adminId: number;

  @ForeignKey(() => CompanyMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  companyId: number;

  @ForeignKey(() => ContactMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  staffId: number;

  @ForeignKey(() => DiningTable)
  @Column({ type: DataType.BIGINT})
  table_id: number;

  @Column(DataType.BIGINT)
  orderId: number;

  @Column(DataType.STRING(50))
  tokenNo: string;

  @Column(DataType.BOOLEAN)
  ac_room: boolean;

  @Column(DataType.BIGINT)
  shift_id: number;

  @Column(DataType.TEXT)
  cooking_instructions: string;

  @Column(DataType.BIGINT)
  customerCount: number;

  @IsIn({
    msg: "Invalid Order Status",
    args: [["pending", "cancelled", "started", "finished","served", "billed"]],
  })
  @Column({
    type: DataType.STRING,
    defaultValue: "pending",
  })
  orderStatus: string;

  @Column(DataType.BOOLEAN) 
  billing_status: boolean;

  @Column(DataType.BIGINT)
  total: number;

  @Column(DataType.BIGINT)
  ac_charge: number;

  @Column({ type: DataType.STRING, allowNull: true })
  paymentMethod: string;

  @HasMany(() => OrderItems)
  orderItems: OrderItems[];

  @BelongsTo(() => ContactMaster, "customerId")
  customer: ContactMaster;

  @BelongsTo(() => ContactMaster, "staffId")
  staff: ContactMaster;

  @BelongsTo(() => User)
  User: User;

  @BelongsTo(() => CompanyMaster)
  CompanyMaster: CompanyMaster;

  @BelongsTo(() => DiningTable)
  table_details: DiningTable;

  @HasOne(() => StaffTransactions)
  transactionDetails: StaffTransactions;

}
