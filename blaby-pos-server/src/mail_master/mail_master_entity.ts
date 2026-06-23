import { STRING } from 'sequelize';
import {
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';

@Table({
  tableName: 'Mail',
})
export class MailMaster extends Model<MailMaster> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  Id: number;
  @Column(STRING)
  email: string;
}
