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
import { PayrollEmployeeCategory } from '../payroll_employeeCategory/employeeCategoryEntity';
import { PayrollPaySheet } from '../payroll_paySheet/paySheetEntity';
import { AccountMaster } from '../account_master/account_master';

@Table({
  tableName: 'payroll_paysheet_items',
})
export class PayrollPaySheetItem extends Model<PayrollPaySheetItem> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(200)) calculationValue: string;

  @ForeignKey(() => PayrollPaySheet)
  @Column(DataType.BIGINT)
  paySheetId: number;

  @BelongsTo(() => PayrollPaySheet)
  paySheet: PayrollPaySheet;

  @ForeignKey(() => AccountMaster)
  @Column(DataType.BIGINT)
  payHeadId: number;

  @BelongsTo(() => AccountMaster)
  payHead: AccountMaster;

  @Column(DataType.STRING(200)) calculationType: string;
  @Column(DataType.DECIMAL(20, 2)) amount: number;
  @Column(DataType.STRING(200)) type: string;

  @Column(DataType.STRING(2000)) percentageof: string;
  @Column(DataType.DECIMAL(11, 2)) percentage: number;
  @Column(DataType.INTEGER) adminId: number;
  @CreatedAt
  @Column({ field: 'createdat' })
  create_at: Date;
  @UpdatedAt
  @Column({ field: 'updatedat' })
  updated_At: Date;
}
