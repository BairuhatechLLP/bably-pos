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
import { LedgerCategory } from '../ledger_category/ledger_category_model';
import { LedgerCategoryGroup } from '../ledger_category_group/ledger_category_group_model';
import { User } from '../users/user.entity';

@Table({
  tableName: 'account_master',
})
export class AccountMaster extends Model<AccountMaster> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;
  @Column(DataType.STRING(100)) nominalcode: string;
  @Column(DataType.STRING(100)) laccount: string;
  @ForeignKey(() => LedgerCategory)
  @Column(DataType.BIGINT)
  category: number;
  @BelongsTo(() => LedgerCategory)
  categoryDetails: LedgerCategory;

  @ForeignKey(() => LedgerCategoryGroup)
  @Column(DataType.BIGINT)
  categorygroup: number;
  @BelongsTo(() => LedgerCategoryGroup)
  groupDetails: LedgerCategoryGroup;

  @Column(DataType.STRING(100)) acctype: string;
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userid: number;
  @BelongsTo(() => User)
  users: User;

  @Column(DataType.STRING(100)) accnum: string;
  @Column(DataType.STRING(100)) cardnum: string;
  @Column(DataType.STRING(100)) paidmethod: string;
  @Column(DataType.STRING(100)) sortcode1: string;
  @Column(DataType.STRING(100)) sortcode2: string;
  @Column(DataType.STRING(100)) sortcode3: string;
  @Column(DataType.STRING(100)) ibannum: string;
  @Column(DataType.STRING(100)) bicnum: string;
  @Column(DataType.DECIMAL(11, 2)) opening: number;
  @Column(DataType.DECIMAL(11, 2)) total: number;

  @Column(DataType.DATE) userdate: Date;
  @Column(DataType.BIGINT) type: number;
  @Column(DataType.BIGINT) adminid: number;

  @Column(DataType.BIGINT) visiblestatus: number;
  @Column(DataType.BIGINT) visbank: number;
  @Column(DataType.BIGINT) vissinvoice: number;
  @Column(DataType.BIGINT) vispinvoice: number;
  @Column(DataType.BIGINT) visotherreceipt: number;
  @Column(DataType.BIGINT) vispayroll: number;
  @Column(DataType.BIGINT) visotherpayment: number;
  @Column(DataType.BIGINT) visjournal: number;
  @Column(DataType.BIGINT) visreport: number;
  @Column(DataType.BIGINT) showVatRate: number;
  @Column(DataType.STRING(200)) payheadType: string;

  @Column(DataType.STRING(100)) journals: string;
  @Column(DataType.STRING(100)) Purchase: string;
  @Column(DataType.STRING(100)) Sales: string;
  @Column(DataType.BIGINT) calculationPeriod: number;
  @Column(DataType.STRING(250)) branch: string;
  @Column(DataType.STRING(250)) ifsc: string;
  @Column(DataType.STRING(255)) accountname: string;

  @Column(DataType.BIGINT) createdBy: number;
  @Column(DataType.BIGINT) companyid?: number;

  @CreatedAt
  @Column({ field: 'createdat' })
  created_at: Date;

  @UpdatedAt
  @Column({ field: 'updatedat' })
  updated_at: Date;
}
