import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  IsIn,
  Min,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { User } from "../users/user.entity";
import { CompanyMaster } from "../company_master/company_master_entity";
import { ProductMaster } from "../product_master/product_master";
import { LocationMaster } from "../locations/location.entity";
import { BomItems } from "../bom_items/bom_items.entity";

@Table({
  tableName: "bom_master",
})
export class BomMaster extends Model<BomMaster> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  adminId: number;

  @ForeignKey(() => CompanyMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  companyId: number;

  @ForeignKey(() => ContactMaster)
  @Column({ type: DataType.BIGINT, allowNull: true })
  staffId: number;

  @IsIn({
    msg: "Invalid User Type",
    args: [["admin", "staff"]],
  })
  @Column(DataType.STRING)
  createdBy: string;

  @ForeignKey(() => ProductMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  productId: number;

  @Min(0.001)
  @Column(DataType.INTEGER)
  quantity: number;

  @ForeignKey(() => LocationMaster)
  @Column({ type: DataType.BIGINT, allowNull: true })
  consumption_location: number;

  @ForeignKey(() => LocationMaster)
  @Column({ type: DataType.BIGINT, allowNull: true })
  production_location: number;

  // @HasMany(() => OrderItems)
  // orderItems: OrderItems[];

  @BelongsTo(() => ContactMaster, "staffId")
  Staff: ContactMaster;

  @BelongsTo(() => User)
  User: User;

  @BelongsTo(() => CompanyMaster)
  CompanyMaster: CompanyMaster;

  @BelongsTo(() => ProductMaster, "productId")
  Product: ProductMaster;

  @BelongsTo(() => LocationMaster, "consumption_location")
  ConsumptionLocation: LocationMaster;

  @BelongsTo(() => LocationMaster, "production_location")
  ProductionLocation: LocationMaster;

  @HasMany(() => BomItems, {
    onDelete: "CASCADE",
    as: "allBomItems",
  })
  allBomItems: BomItems[];

  @HasMany(() => BomItems, {
    onDelete: "CASCADE",
    scope: {
      type: "composite",
    },
    as: "compositeBomItems",
  })
  compositeBomItems: BomItems[];

  @HasMany(() => BomItems, {
    onDelete: "CASCADE",
    scope: {
      type: "byProduct",
    },
    as: "byProductBomItems",
  })
  byProductBomItems: BomItems[];
}
