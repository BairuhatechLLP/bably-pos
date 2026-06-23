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
} from 'sequelize-typescript';

import { AccountMaster } from '../account_master/account_master';
import { PurchaseInvoice } from '../purchase_invoice/purchase_invoice_model';
import { SaleInvoice } from '../sale_invoice/sale_invoice';
import { User } from '../users/user.entity';
import { LocationMaster } from '../locations/location.entity';

@Table({
  tableName: 'ledger_details',
})
export class LedgerDetails extends Model<LedgerDetails> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userid?: number;
  @BelongsTo(() => User)
  user: User[];

  @Column(DataType.STRING(100)) baseid: string;
  @Column(DataType.DECIMAL(11, 2)) credit: number;
  @Column(DataType.DECIMAL(11, 2)) debit: number;
  @Column(DataType.STRING(100)) type: string;
  @Column(DataType.STRING(100)) bankid: string;

  @ForeignKey(() => AccountMaster)
  @Column(DataType.BIGINT)
  ledger: number;
  @BelongsTo(() => AccountMaster, { as: 'accountMasterDetails' })
  ledgerDetails: AccountMaster;

  @Column(DataType.BIGINT) ledgercategory: number;

  @ForeignKey(() => SaleInvoice)
  @Column(DataType.BIGINT)
  saleid: number;
  @BelongsTo(() => SaleInvoice)
  sale: SaleInvoice;

  @ForeignKey(() => PurchaseInvoice)
  @Column(DataType.BIGINT)
  purchaseid: number;
  @BelongsTo(() => PurchaseInvoice)
  purchase: PurchaseInvoice;

  @Column(DataType.STRING(100)) journalid: string;
  @Column(DataType.STRING(100)) invoiceid: string;
  @Column(DataType.STRING(100)) receiptid: string;
  @Column(DataType.STRING(100)) otherid: string;

  @Column(DataType.DECIMAL) adminid: number;
  @Column(DataType.DECIMAL(11, 2)) total: number;
  @Column(DataType.STRING(100)) invoiceno: string;
  @Column(DataType.DATE) userdate: string;
  @Column(DataType.STRING(100)) cname: string;
  @Column(DataType.STRING(100)) customer_name: string;
  @Column(DataType.STRING(100)) idescription: string;
  @Column(DataType.DATE) sdate: string;
  @Column(DataType.DATE) ldate: Date;
  @Column(DataType.DECIMAL(11, 2)) totalamount: number;
  @Column(DataType.DECIMAL(11, 2)) outstanding: number;
  @Column(DataType.STRING(100)) status: string;
  @Column(DataType.BIGINT) discount_status: number;
  @Column(DataType.STRING(100)) reference: string;
  @Column(DataType.DECIMAL(11, 2)) usedamount: number;
  @Column(DataType.STRING(100)) transferid: string;
  @Column(DataType.STRING(100)) paidmethod: string;
  @Column(DataType.DECIMAL(11, 2)) amount: number;
  @Column(DataType.STRING(100)) paidfrom: string;
  @Column(DataType.STRING(100)) details: string;
  @Column(DataType.BIGINT) checked: number;
  @Column(DataType.DECIMAL(11, 2)) discount: number;
  @Column(DataType.DECIMAL(11, 2)) incomeTax: number;
  @Column(DataType.STRING(100)) description: string;
  @Column(DataType.STRING(100)) referenceid: string;
  @Column(DataType.BIGINT) reconcile_status: number;
  @Column(DataType.BIGINT) reconcileid: number;
  @Column(DataType.STRING(100)) reconcile_date: string;
  @Column(DataType.STRING(100)) used: string;
  @Column(DataType.BIGINT) booleantype: number;
  @Column(DataType.STRING(100)) usertype: string;
  @Column(DataType.DECIMAL(11, 2)) costprice: number;
  @Column(DataType.BIGINT) quantity: number;
  @Column(DataType.DECIMAL(11, 2)) percentage: number;
  @Column(DataType.DECIMAL(11, 2)) incomeTaxAmount: number;
  @Column(DataType.STRING(100)) priceType: string;
  @Column(DataType.STRING(200)) invoiceimage: string;
  @Column(DataType.STRING(200)) invoicedoc: string;
  @Column(DataType.DECIMAL(11, 2)) vat: number;
  @Column(DataType.DECIMAL(11, 2)) vatamt: number;
  @Column(DataType.DECIMAL(11, 2)) totalamt: number;
  @Column(DataType.BIGINT) includevat: number;
  @Column(DataType.BIGINT) showVat: number;
  @Column(DataType.BIGINT) itemorder: number;
  @Column(DataType.BIGINT) running_total: number;
  @Column(DataType.BIGINT) payrollid: number;
  @Column(DataType.BIGINT) employeeid: number;
  @Column(DataType.BIGINT) createdBy: number;
  @Column(DataType.BIGINT) companyid?: number;
  @Column(DataType.BIGINT) stockTransferId: number;
  @Column(DataType.BIGINT) overall_parcel_charge: number;

  @ForeignKey(() => LocationMaster)
  @Column(DataType.BIGINT)
  seriesNo: number;
  @BelongsTo(() => LocationMaster)
  locationDetails: LocationMaster;

  @CreatedAt
  @Column({ field: 'createdat' })
  created_at: Date;

  @UpdatedAt
  @Column({ field: 'updatedat' })
  updated_at: Date;

  @Column(DataType.BOOLEAN) is_deleted: boolean;
}
