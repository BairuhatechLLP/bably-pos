import {
  AutoIncrement,
  PrimaryKey,
  Column,
  Table,
  DataType,
  Model,
  CreatedAt,
  UpdatedAt,
  Unique,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Countries } from "../countries/countries_model";
@Table({
  tableName: "affiliations",
})
export class Affiliations extends Model<Affiliations> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(100))
  name: string;

  @Column(DataType.STRING(100))
  email: string;

  @Column(DataType.STRING(15))
  phone: string;

  @Unique
  @Column(DataType.STRING(100))
  affiliationCode: string;

  @Column(DataType.BIGINT)
  noOfPersons: number;

  @Column(DataType.STRING(200))
  image: string;

  @Column(DataType.JSON)
  details: any;

  @Column(DataType.STRING(100))
  affiliationLink: string;

  @Column(DataType.DOUBLE)
  amountEarned: number;

  @Column(DataType.DOUBLE)
  rewardPercentage: number;

  @ForeignKey(() => Countries)
  @Column(DataType.BIGINT)
  countryid?: number;
  @BelongsTo(() => Countries)
  countryInfo: Countries;

  @CreatedAt
  @Column({ field: "createdat" })
  createdat: Date;

  @UpdatedAt
  @Column({ field: "updatedat" })
  updatedat: Date;
}
