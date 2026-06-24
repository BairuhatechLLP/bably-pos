import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'product_category',
  timestamps: true,
  createdAt: 'createdat',
  updatedAt: 'updatedat',
})
export class ProductCategory extends Model {
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
  declare category: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'categoryType',
  })
  declare categoryType: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  declare userid: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  declare companyid: number;

  @Column({
    type: DataType.TINYINT,
    defaultValue: 0,
    field: 'isDeleted',
  })
  declare isDeleted: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'id_short',
  })
  declare id_short: string;

  @Column({
    type: DataType.TINYINT,
    defaultValue: 1,
    field: 'is_show_in_report',
  })
  declare is_show_in_report: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'alias_name',
  })
  declare alias_name: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
    field: 'display_id',
  })
  declare display_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'createdat',
  })
  declare createdat: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'updatedat',
  })
  declare updatedat: Date;
}
