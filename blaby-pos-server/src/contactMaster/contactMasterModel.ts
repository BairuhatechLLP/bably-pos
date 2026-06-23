import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Contractors } from "../shared/constants/constants";
import { OrderMaster } from "../order_master/order_master.entity";
import { BomMaster } from "../bom_master/bom_master.entity";

@Table({
  tableName: "contact_master",
})
export class ContactMaster extends Model<ContactMaster> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(150))
  name: string;
  @Column(DataType.STRING(150))
  bus_name: string;
  @Column(DataType.STRING(150))
  email: string;
  @Column(DataType.STRING(20))
  mobile: string;
  @Column(DataType.STRING(20))
  telephone: string;
  @Column(DataType.STRING(250))
  address: string;
  @Column(DataType.STRING(150))
  city: string;
  @Column(DataType.STRING(150))
  postcode: string;
  @Column(DataType.STRING(150))
  acc_default: string;
  @Column(DataType.STRING(150))
  notes: string;
  @Column(DataType.STRING(150))
  reference: string;
  @Column(DataType.STRING(150))
  vat_number: string;
  @Column(DataType.BIGINT)
  userid: number;
  @Column(DataType.BIGINT)
  adminid: number;
  @Column(DataType.DATE)
  userdate: Date;
  @Column(DataType.BOOLEAN)
  active: boolean;

  @Column(DataType.ENUM(...Object.values(Contractors)))
  contractors_type: Contractors;

  @Column(DataType.BIGINT)
  ledger_category: number;

  @Column(DataType.BIGINT)
  opening_balance: number;

  @CreatedAt
  @Column({ field: "createdat" })
  createdat: Date;
  @UpdatedAt
  @Column({ field: "updatedat" })
  updatedat: Date;

  @Column(DataType.BOOLEAN) is_deleted: boolean;

  @Column(DataType.STRING(150))
  password: string;

  @Column(DataType.STRING(150))
  staffId: string;

  @Column(DataType.STRING(200))
  image: string;

  @Column(DataType.STRING(2000))
  access: string;

  @Column(DataType.STRING(200))
  country: string;

  @Column(DataType.STRING(200))
  state: string;

  @Column(DataType.BIGINT)
  createdBy: number;

  @Column(DataType.BIGINT)
  companyid?: number;

  @Column(DataType.STRING(20))
  loyaltyCardNumber?: string;

  @Column(DataType.STRING(20))
  referredCode?: string;

  @Column({ type: DataType.DOUBLE ,defaultValue:0.00, allowNull: false })
  loyaltyPoints?: number;

  @Column(DataType.BIGINT)
  referralCount?: number;

  @Column(DataType.BIGINT)
  referralPoint?: number;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [],
  })
  staffAccess: string[];

  @HasMany(() => OrderMaster, "customerId")
  customers: OrderMaster[];

  @HasMany(() => OrderMaster, "staffId")
  staff: OrderMaster[];

  @HasMany(() => BomMaster, {
    foreignKey: "staffId",
    onDelete: 'SET NULL',
  })
  bomMaster: BomMaster[];
}
