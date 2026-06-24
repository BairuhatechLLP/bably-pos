import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'company_master',
  timestamps: false,
})
export class CompanyMaster extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  bname: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  fulladdress: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  state: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  city: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  adminid: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive: boolean;
}
