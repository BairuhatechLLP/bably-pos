import { Column, DataType, Table, Model, PrimaryKey } from 'sequelize-typescript';

@Table({
  tableName: 'OTP_LOG',
})
export class Sms extends Model<Sms> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ field: 'Phone_number' })
  phonenumber: string;

  @Column(DataType.BOOLEAN)
  isVerified: Boolean;
}