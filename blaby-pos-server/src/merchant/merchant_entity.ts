import {
  Table,
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({
  tableName: 'Merchant',
})
export class Merchant extends Model<Merchant> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id: number;

  @Column({ type: DataType.STRING })
  merchand_id: string;

  @Column({ type: DataType.STRING })
  account_type: string;

  @Column({ type: DataType.STRING })
  account_name: string;

  @Column({ type: DataType.STRING })
  private_key: string;

  @Column({ type: DataType.STRING })
  registered_id: string;

  @Column({ type: DataType.STRING })
  registered_name: string;

  @Column({ type: DataType.STRING })
  type: string;

  @Column({ type: DataType.INTEGER })
  user_id: number;

  @Column({ type: DataType.STRING })
  vendor_name: string;

  @Column({ type: DataType.STRING })
  pos_vendor_name: string;

  @Column({ type: DataType.STRING })
  device_id: string;

  @Column({ type: DataType.STRING })
  pos_registered_id: string;

  @Column({ type: DataType.STRING })
  pos_registered_name: string;

  @Column({ type: DataType.STRING })
  pos_business_name: string;
}
