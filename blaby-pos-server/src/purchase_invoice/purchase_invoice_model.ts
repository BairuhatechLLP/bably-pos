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
} from "sequelize-typescript";
import { AccountMaster } from "../account_master/account_master";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { User } from "../users/user.entity";
import { LocationMaster } from "../locations/location.entity";

@Table({
  tableName: "purchase_invoice",
})
export class PurchaseInvoice extends Model<PurchaseInvoice> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userid?: number;
  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => ContactMaster)
  @Column(DataType.BIGINT)
  supplierid?: number;

  @Column(DataType.DECIMAL(11, 2)) quantity: number;
  @Column(DataType.DECIMAL(11, 2)) stockid: number;

  @BelongsTo(() => ContactMaster)
  supplier: ContactMaster;

  @Column(DataType.STRING(100))
  invoiceno: string;

  @Column({ field: "sdate" })
  sdate: Date;

  @Column({ field: "ldate" })
  ldate: Date;

  @Column(DataType.FLOAT(11, 2))
  total: number;

  @Column(DataType.FLOAT(11, 2))
  outstanding: number;

  @Column(DataType.STRING(1000))
  sname: string;

  @Column(DataType.BIGINT)
  status: number;

  @Column(DataType.STRING(1000))
  type: string;

  @Column(DataType.BIGINT)
  adminid: number;

  @Column({ field: "userdate" })
  userdate: Date;

  @Column(DataType.BLOB)
  invoiceimage: Buffer;

  @Column(DataType.BLOB)
  invoicedoc: Buffer;

  @Column(DataType.STRING(255))
  quotes: string;

  @Column(DataType.TINYINT)
  share: number;

  @Column(DataType.BIGINT)
  refid: number;

  @Column(DataType.STRING)
  purchase_ref: string;

  @Column(DataType.STRING(50)) usertype: string;

  @ForeignKey(() => AccountMaster)
  @Column(DataType.BIGINT)
  ledger: number;
  @BelongsTo(() => AccountMaster)
  ledgerDetails: AccountMaster;
  @Column(DataType.DATE)
  paymentdate: Date;

  @ForeignKey(() => LocationMaster)
  @Column(DataType.BIGINT)
  seriesNo: number;
  @BelongsTo(() => LocationMaster)
  locationDetails: LocationMaster;

  @Column(DataType.DECIMAL(20, 2)) roundOff: number;
  @Column(DataType.DECIMAL(20, 2)) taxable_value: number;
  @Column(DataType.DECIMAL(20, 2)) total_vat: number;
  @Column(DataType.DECIMAL(20, 2)) overall_discount: number;

  @Column(DataType.BIGINT)
  createdBy: number;

  @Column(DataType.BIGINT)
  companyid?: number;

  @CreatedAt
  @Column({ field: "createdat" })
  createdat: Date;

  @UpdatedAt
  @Column({ field: "updatedat" })
  updatedat: Date;
  static ledger: any;
}
