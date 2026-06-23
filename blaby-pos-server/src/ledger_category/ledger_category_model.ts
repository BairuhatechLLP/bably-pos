import {
  AutoIncrement,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'ledger_category_master',
})
export class LedgerCategory extends Model<LedgerCategory> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(1000))
  category: string;

  @Column(DataType.BIGINT)
  adminid: number;
  
  @Column(DataType.BIGINT)
  categorygroup: number;

  @Column(DataType.BIGINT)
  createdBy: number;

  @Column(DataType.BIGINT)
  companyid: number;

  @CreatedAt
  @Column({ field: 'createdat' })
  createdat: Date;
  @UpdatedAt
  @Column({ field: 'updatedat' })
  updatedat: Date;
}
