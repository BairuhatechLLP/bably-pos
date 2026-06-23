import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";

@Table({ tableName: "plan" })
export class Plan extends Model<Plan> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.BIGINT })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  company: number;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  counter: number;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  retailXpressWithTaxgo: number;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  soleTrader: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  period: number;

  @Column({ type: DataType.STRING, allowNull: false })
  currencyCode: string;
}
