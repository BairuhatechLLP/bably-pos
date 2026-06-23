import {
  Table,
  PrimaryKey,
  Model,
  AutoIncrement,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'business_category',
})
export class BusinessCategory extends Model<BusinessCategory> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(1000))
  btitle: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at' })
  deletedAt: Date;

  @Column(DataType.BIGINT)
  status: number;

  @Column(DataType.BIGINT)
  adminid: number;
}
