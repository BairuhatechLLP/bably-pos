import {
  Table,
  PrimaryKey,
  AutoIncrement,
  Column,
  DataType,
  Model,
  UpdatedAt,
  CreatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "audit_log",
})
export class AuditLog extends Model<AuditLog> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.BIGINT)
  adminid: number;

  @Column(DataType.BIGINT)
  userid: number;

  @Column(DataType.STRING(20)) method: string;
  @Column(DataType.STRING(500)) url: string;
  @Column(DataType.JSON) params: string;
  @Column(DataType.STRING(50)) status: string;
  @Column(DataType.JSON) request: string;
  @Column(DataType.JSON) response: string;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt?: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt?: Date;
}
