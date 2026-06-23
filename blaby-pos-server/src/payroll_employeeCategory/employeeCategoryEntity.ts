import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'payroll_employee_category',
})
export class PayrollEmployeeCategory extends Model<PayrollEmployeeCategory> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(200)) emplyeeCategory: string;

  @Column(DataType.INTEGER) adminId: number;
  @Column(DataType.INTEGER) companyid: number;
  @Column(DataType.INTEGER) isDleted: number;

  @CreatedAt
  @Column({ field: 'createdat' })
  create_at: Date;
  @UpdatedAt
  @Column({ field: 'updatedat' })
  updated_At: Date;
}
