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
import { PayrollEmployee } from '../payroll_employees/employeeEntity';

@Table({
  tableName: 'payroll_paysheet',
})
export class PayrollPaySheet extends Model<PayrollPaySheet> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => PayrollEmployee)
  @Column(DataType.BIGINT)
  employeeId: number;

  @BelongsTo(() => PayrollEmployee) 
  employee: PayrollEmployee;

  @Column(DataType.BIGINT)
  totalDeduction: number;

  @Column(DataType.BIGINT)
  totalEarnings: number;

  @Column(DataType.BIGINT)
  netSalary: number;

  @Column(DataType.BIGINT)
  adminId: number;

  @Column(DataType.BIGINT)
  companyid: number;

  @CreatedAt
  @Column({ field: 'createdat' })
  create_at: Date;
  @UpdatedAt
  @Column({ field: 'updatedat' })
  updated_At: Date;
}
