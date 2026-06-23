import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "../users/user.entity";
 
@Table({ tableName: "subscription" })
export class Subscriptions extends Model<Subscriptions> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.BIGINT })
  id: number;

  @ForeignKey(() => User)
  @Unique
  @Column({ type: DataType.BIGINT, allowNull: false })
  userId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  company: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  counter: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  period: number;

  @Column({ type: DataType.DOUBLE, allowNull: false })
  price: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  retailXpressWithTaxgo: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  soleTrader: boolean;

  @Column({ type: DataType.DATE, allowNull: false })
  subscriptionExpiry: Date;

  @BelongsTo(() => User)
  userDetails: User;
}
