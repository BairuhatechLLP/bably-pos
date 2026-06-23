import {
  Table,
  Column,
  Model,
  Unique,
  IsEmail,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  HasMany,
  HasOne,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";

import { Countries } from "./../countries/countries_model";
import { Subscriptions } from "../subscriptions/subscriptions.entity";
import { OrderMaster } from "../order_master/order_master.entity";
import { BomMaster } from "../bom_master/bom_master.entity";
@Table({
  tableName: "user",
})
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => Countries)
  @Column(DataType.BIGINT)
  countryid?: number;
  @BelongsTo(() => Countries)
  countryInfo: Countries;

  @Column(DataType.STRING(200))
  fullName?: string;

  @Unique
  @IsEmail
  @Column
  email: string;

  @Column(DataType.STRING(150))
  password: string;

  @Column(DataType.STRING(200))
  image: string;

  @Column(DataType.STRING(200))
  address: string;

  @Column(DataType.STRING(200))
  city: string;

  @Column(DataType.STRING(15))
  phonenumber?: string;

  @Column(DataType.DATEONLY)
  dob: Date;

  @Column(DataType.BOOLEAN)
  isTaxgo: boolean;

  @Column(DataType.STRING)
  verifycode?: string;

  @Column(DataType.INTEGER)
  emailverified?: number;

  @Column(DataType.INTEGER)
  mobileverified?: number;

  @Column(DataType.STRING)
  affiliationCode?: string;

  @Column(DataType.BOOLEAN)
  isAffiliateCodeUsed?: boolean;

  @CreatedAt
  @Column({ field: "createdat" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updatedat" })
  updatedAt: Date;

  @DeletedAt
  @Column({ field: "deletedat" })
  deletedAt: Date;

  @HasOne(() => Subscriptions)
  subscription: Subscriptions;

  @HasMany(() => OrderMaster)
  orderMaster: OrderMaster[];

  @HasMany(() => BomMaster, {
    onDelete: "CASCADE",
  })
  bomMaster: BomMaster[];
}
