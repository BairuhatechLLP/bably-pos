import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Countries } from '../countries/countries_model';

@Table({
  tableName: 'tax_master',
})
export class Tax extends Model<Tax> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(100))
  type: string;

  @Column(DataType.DOUBLE(11, 2))
  percentage: number;

  @Column(DataType.BIGINT) 
  adminid: number;

  @Column(DataType.BIGINT) 
  companyid: number;

  @ForeignKey(() => Countries)
  @Column(DataType.BIGINT)
  countryid?: number;
  @BelongsTo(() => Countries)
  country: Countries;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt?: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt?: Date;

  @DeletedAt
  @Column({ field: 'deleted_at' })
  deletedAt?: Date;
}
