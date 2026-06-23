import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { AccountMaster } from "../account_master/account_master";

@Table({ tableName: "other_master" })
export class OtherMaster extends Model<OtherMaster> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.BIGINT })
  id: number;

  @Column(DataType.STRING(100))
  type: string;

  @Column({ type: DataType.BIGINT, allowNull: false })
  adminId: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  companyId: number;

  @Column({ type: DataType.DOUBLE })
  total: number;

  @ForeignKey(() => ContactMaster)
  @Column({ type: DataType.BIGINT })
  cname: number;
  @BelongsTo(() => ContactMaster)
  customer: ContactMaster;

  @ForeignKey(() => AccountMaster)
  @Column(DataType.BIGINT)
  ledgerId: number;
  @BelongsTo(() => AccountMaster)
  ledgerDetails: AccountMaster;

  @Column({ type: DataType.BIGINT })
  bankid: number;

  @Column(DataType.STRING(100))
  reference: string;

  @Column({ type: DataType.BIGINT })
  createdBy: number;

  @Column({ type: DataType.DATE, allowNull: false })
  date: Date;

  @CreatedAt
  @Column({ field: "createdat" })
  createdat: Date;

  @UpdatedAt
  @Column({ field: "updatedat" })
  updatedat: Date;
}
