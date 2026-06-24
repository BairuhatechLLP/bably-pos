import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'kitchen_display',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class KitchenDisplay extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
    field: 'admin_id',
  })
  declare admin_id: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
    field: 'company_id',
  })
  declare company_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'createdAt',
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'updatedAt',
  })
  declare updatedAt: Date;
}
