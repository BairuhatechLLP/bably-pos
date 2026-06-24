import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'user',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class User extends Model {
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
  name: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'staff',
  })
  role: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  })
  is_active: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  adminId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  companyId: number;
}
