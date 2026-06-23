import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { AccountMaster } from "../account_master/account_master";
import { BomMaster } from "../bom_master/bom_master.entity";
import { Countries } from "../countries/countries_model";
import { OrderMaster } from "../order_master/order_master.entity";

@Table({
  tableName: "company_master",
})
export class CompanyMaster extends Model<CompanyMaster> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.BIGINT)
  status: number;

  @Column(DataType.STRING(100)) type: string;
  @Column(DataType.STRING(100)) expiretime: string;
  @Column(DataType.STRING(200)) bname: string;
  @Column(DataType.STRING(100)) btype: string;
  @Column(DataType.STRING(50)) registerno: string;
  @Column(DataType.STRING(100)) rtype: string;
  @Column(DataType.DATE) rdate: Date;
  @Column(DataType.DATE) expiredate: Date;
  @Column(DataType.STRING(100)) plan: string;
  @Column(DataType.STRING(100)) company: string;
  @Column(DataType.STRING(200)) address1: string;
  @Column(DataType.STRING(200)) address2: string;
  @Column(DataType.STRING(100)) city: string;
  @Column(DataType.STRING(200)) cemail: string;
  @Column(DataType.STRING(20)) cphoneno: string;
  @Column(DataType.STRING(100)) cperson: string;
  @Column(DataType.STRING(100)) taxregno: string;
  @Column(DataType.STRING(100)) tax: string;
  @Column(DataType.STRING(100)) taxno: string;
  @Column(DataType.STRING(200)) logo: string;
  @Column(DataType.BIGINT) adminid: number;
  @Column(DataType.BIGINT) userid: number;
  @Column(DataType.STRING(250)) bimage: string;
  @Column(DataType.STRING(100)) bcategory: string;
  @Column(DataType.STRING(100)) accounttype: string;
  @Column(DataType.STRING(100)) defaultmail: string;
  @Column(DataType.STRING(100)) defaultinvoice: string;
  @Column(DataType.STRING(100)) accplan: string;
  @Column(DataType.STRING(100)) cusNotes: string;
  @Column(DataType.STRING(250)) fulladdress: string;
  @Column(DataType.STRING(100)) website: string;
  @Column(DataType.BIGINT) reporttype: number;
  @Column(DataType.STRING(100)) endYear: string;
  @Column(DataType.STRING(100)) defaultTerms: string;
  @Column(DataType.STRING(200)) stripeKey: string;
  @Column(DataType.STRING(200)) payStackKey: string;

  @ForeignKey(() => AccountMaster)
  @Column(DataType.BIGINT)
  defaultBank: number;
  @BelongsTo(() => AccountMaster)
  bankInfo: AccountMaster;

  @ForeignKey(() => Countries)
  @Column(DataType.BIGINT)
  country: number;
  @BelongsTo(() => Countries)
  countryInfo: Countries;

  @Column(DataType.STRING(250)) state: string;
  @Column(DataType.STRING(250)) stripe_offline_link: string;
  @Column(DataType.STRING(100)) defaultMerchant: string;

  @Column({ field: "financial_year_start" })
  financial_year_start: Date;

  @Column({ field: "books_begining_from" })
  books_begining_from: Date;

  @Column(DataType.STRING(100)) workingTimeFrom: string;
  @Column(DataType.STRING(100)) workingTimeTo: string;
  @Column(DataType.BOOLEAN) isUniformShifts: boolean;

  @Column(DataType.BOOLEAN) isOtherTerritory: boolean;
  @Column(DataType.BOOLEAN) isEwayBill: boolean;
  @Column(DataType.BOOLEAN) isEInvoice: boolean;

  @Column(DataType.BOOLEAN)
  isLoyaltyEnabled: boolean;

  @Column({ type: DataType.DOUBLE })
  loyaltyDiscountPercentage: number;

  @Column({ type: DataType.DOUBLE })
  referralPoint: number;

  @Column({ type: DataType.DOUBLE })
  loyaltyRedeemLimit: number;

  @CreatedAt
  @Column({ field: "created_at" })
  created_at: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updated_at: Date;

  @DeletedAt
  @Column({ field: "deleted_at" })
  deletedAt: Date;

  @HasMany(() => OrderMaster)
  orderMaster: OrderMaster[];

  @HasMany(() => BomMaster, {
    onDelete: "CASCADE",
  })
  bomMaster: BomMaster[];
}
