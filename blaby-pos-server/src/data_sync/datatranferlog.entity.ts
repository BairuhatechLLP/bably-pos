import {
  Table,
  PrimaryKey,
  Model,
  AutoIncrement,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "data_transfer_log",
})
export class DataTransferLog extends Model<DataTransferLog> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.INTEGER)
  adminId: number;

  @Column(DataType.STRING)
  process1: string;
  @Column(DataType.STRING)
  process1status: string;
  @Column(DataType.JSON)
  process1response: object;

  @Column(DataType.STRING)
  process2: string;
  @Column(DataType.STRING)
  process2status: string;
  @Column(DataType.JSON)
  process2response: object;

  @Column(DataType.STRING)
  process3: string;
  @Column(DataType.STRING)
  process3status: string;
  @Column(DataType.JSON)
  process3response: object;

  @Column(DataType.STRING)
  process4: string;
  @Column(DataType.STRING)
  process4status: string;
  @Column(DataType.JSON)
  process4response: object;

  @Column(DataType.STRING)
  process5: string;
  @Column(DataType.STRING)
  process5status: string;
  @Column(DataType.JSON)
  process5response: object;

  @Column(DataType.BOOLEAN)
  isComplted: boolean;

  @Column(DataType.INTEGER)
  retry: number;

  @Column(DataType.DATE)
  date: Date;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;
}
