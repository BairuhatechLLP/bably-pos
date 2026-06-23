import {
  AutoIncrement,
  PrimaryKey,
  Column,
  Table,
  DataType,
  Model,
  CreatedAt,
} from 'sequelize-typescript';
@Table({
  tableName: 'contactus_details',
})
export class Contactus extends Model<Contactus> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column
  name: string;

  @Column
  email: string;

  @Column
  phone: string;

  @Column
  message: string;

  @Column
  ContactOption: string;

  @Column
  timeZone: string;

  @Column
  sdate: string;

  @CreatedAt
  @Column({ field: 'createdat' })
  createdat: Date;
}
