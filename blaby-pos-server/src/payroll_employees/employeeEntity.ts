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

@Table({
  tableName: 'payroll_employees',
})
export class PayrollEmployee extends Model<PayrollEmployee> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(200)) firstName: string;
  @Column(DataType.STRING(200)) lastName: string;
  @Column(DataType.STRING(100)) employeeNumber: string;
  @Column(DataType.STRING(200)) eircode: string;
  @Column(DataType.STRING(200)) phone: string;
  @Column(DataType.STRING(200)) email: string;
  @Column(DataType.STRING(1000)) fullAddress: string;
  @Column(DataType.STRING(200)) Designation: string;
  @Column(DataType.STRING(200)) accountHolderName: string;
  @Column(DataType.STRING(200)) accountNumber: string;
  @Column(DataType.STRING(200)) branch: string;
  @Column(DataType.STRING(200)) IFSC: string;
  @Column(DataType.INTEGER) adminId: number;

  @ForeignKey(() => PayrollEmployeeCategory)
  @Column(DataType.BIGINT)
  employeeGroup: number;
  @BelongsTo(() => PayrollEmployeeCategory)
  employeeGroupDetails: PayrollEmployeeCategory;

  @Column(DataType.BIGINT)
  salaryPackage: number;

  @Column(DataType.BIGINT)
  createdBy: number;

  @Column(DataType.BIGINT)
  companyid: number;

  @Column
  date_of_join: Date;
  @CreatedAt
  @Column({ field: 'createdat' })
  create_at: Date;
  @UpdatedAt
  @Column({ field: 'updatedat' })
  updated_At: Date;
}
