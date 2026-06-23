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
import { AccountMaster } from '../account_master/account_master';
import { ContactMaster } from '../contactMaster/contactMasterModel';
import { User } from '../users/user.entity';
import { LocationMaster } from '../locations/location.entity';

@Table({
  tableName: 'sale_invoice',
})
export class SaleInvoice extends Model<SaleInvoice> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userid?: number;
  @BelongsTo(() => User)
  user: User[];

  @Column(DataType.STRING(200)) cname: string;
  @Column(DataType.STRING(200)) inaddress: string;
  @Column(DataType.STRING(200)) deladdress: string;

  @ForeignKey(() => ContactMaster)
  @Column(DataType.BIGINT)
  customerid: number;
  @BelongsTo(() => ContactMaster)
  customer: ContactMaster;

  @ForeignKey(() => LocationMaster)
  @Column(DataType.BIGINT)
  seriesNo: number;
  @BelongsTo(() => LocationMaster)
  locationDetails: LocationMaster;
  
  @Column(DataType.STRING(200)) issued: string;
  @Column(DataType.STRING(200)) invoiceno: string;
  @Column(DataType.STRING(200)) type: string;
  @Column(DataType.STRING(200)) attachment: string;
  @Column(DataType.STRING(200)) quotes: string;
  @Column(DataType.STRING(400)) terms: string;
  @Column(DataType.STRING(200)) reference: string;

  @Column(DataType.DATE) userdate: Date;
  @Column(DataType.DATE) sdate: Date;
  @Column(DataType.DATE) ldate: Date;
  @Column(DataType.DECIMAL(11, 2)) total: number;
  @Column(DataType.DECIMAL(11, 2)) outstanding: number;
  @Column(DataType.BIGINT) status: number;
  @Column(DataType.BIGINT) adminid: number;
  @Column(DataType.BIGINT) share: number;
  @Column(DataType.STRING) salesType: string;
  @Column(DataType.BIGINT)
  refid: number;

  @Column(DataType.STRING)
  sales_ref: string;

  @Column(DataType.STRING)
  roundOff: string;

  @Column(DataType.DATE)
  paymentdate: Date;
  @ForeignKey(() => AccountMaster)
  @Column(DataType.BIGINT)
  ledger: number;
  @BelongsTo(() => AccountMaster)
  ledgerDetails: AccountMaster;

  @Column(DataType.DECIMAL(11, 2)) salestock: number;
  @Column(DataType.DECIMAL(11, 2)) stockid: number;

  @Column(DataType.DECIMAL(20, 2)) taxable_value: number;
  @Column(DataType.DECIMAL(20, 2)) total_vat: number;
  @Column(DataType.DECIMAL(20, 2)) overall_discount: number;

  @Column(DataType.DECIMAL(20, 2)) overall_parcel_charge: number;

  @Column(DataType.BIGINT) createdBy: number;
  @Column(DataType.BIGINT) companyid: number;
  @Column(DataType.STRING(50)) usertype: string;

  @Column(DataType.BIGINT) loyaltyDiscountAmount: number;

  @CreatedAt
  @Column({ field: 'createdat' })
  created_at: Date;

  @UpdatedAt
  @Column({ field: 'updatedat' })
  updated_at: Date;
}
