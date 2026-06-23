import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "retailCustomer",
})
export class RetailCustomerEntity extends Model<RetailCustomerEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.BIGINT)
  adminid: number;
  @Column(DataType.BIGINT)
  companyid: number;
  @Column(DataType.BIGINT)
  outstanding: number;
  @Column(DataType.STRING(200))
  phonenumber: string;
  @Column(DataType.STRING(200))
  card_number: string;
  @Column(DataType.STRING(200))
  email: string;
  @Column(DataType.STRING(200))
  name: string;
  @Column(DataType.BIGINT)
  status: number;
  @Column(DataType.BIGINT)
  refferalId: number;
  @Column({ type: DataType.DOUBLE })
  refferalPoint: number;
  @Column({ type: DataType.DOUBLE })
  loyaltyPoint: number;

  @CreatedAt
  @Column({ field: "createdat" })
  created_at: Date;

  @UpdatedAt
  @Column({ field: "updatedat" })
  updated_at: Date;
}
