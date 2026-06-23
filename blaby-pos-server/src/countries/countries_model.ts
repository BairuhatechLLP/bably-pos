import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from 'sequelize-typescript';
import { Tax } from './../tax_master/tax_master_entity';

@Table({
  tableName: 'country_master',
})
export class Countries extends Model<Countries> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @HasMany(() => Tax, {
    onDelete: 'CASCADE',
  })
  tax: Tax;

  @Column(DataType.STRING(3))
  code: string;

  @Column(DataType.STRING(150))
  name: string;

  @Column(DataType.STRING(50))
  phoneCode: string;

  @Column(DataType.STRING(50))
  currencycode: string;

  @Column(DataType.STRING(50))
  currency: string;

  @Column(DataType.STRING(50))
  symbol: string;

  @Column(DataType.STRING(50))
  taxtype: string;

  @Column(DataType.STRING(50))
  maincurrency: string;

  @Column(DataType.STRING(50))
  subcurrency: string;

  @CreatedAt
  @Column({ field: 'createdat' })
  createdat: Date;
  @UpdatedAt
  @Column({ field: 'updatedat' })
  updatedat: Date;

  @HasMany(()=>Tax)
  taxs:Tax
}
