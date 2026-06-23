import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  HasMany,
  IsIn,
  Min,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { ProductionItems } from "../production_items/production_items.entity";
import { ProductMaster } from "../product_master/product_master";
import { LocationMaster } from "../locations/location.entity";

@Table({
  tableName: "production_master",
})
export class ProductionMaster extends Model<ProductionMaster> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  // @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  adminId: number;

  // @ForeignKey(() => CompanyMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  companyId: number;

  // @ForeignKey(() => ContactMaster)
  @Column({ type: DataType.BIGINT, allowNull: true })
  staffId: number;

  @IsIn({
    msg: "Invalid User Type",
    args: [["admin", "staff"]],
  })
  @Column(DataType.STRING)
  createdBy: string;

  // @ForeignKey(() => BomMaster)
  @Column({ type: DataType.BIGINT, allowNull: true })
  bomId: number;

  // @ForeignKey(() => ProductMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  productId: number;

  @Column(DataType.DOUBLE)
  batchQuantity: number;

  @Column(DataType.DOUBLE)
  productionQuantity: number;

  @Column(DataType.DOUBLE)
  totalCostPrice: number;

  @Column(DataType.DOUBLE)
  totalProductCostPrice: number;

  @Column(DataType.DOUBLE)
  totalProductSalesPrice: number;

  // @ForeignKey(() => LocationMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  consumptionLocationId: number;

  // @ForeignKey(() => LocationMaster)
  @Column({ type: DataType.BIGINT, allowNull: false })
  productionLocationId: number;

  // @BelongsTo(() => ContactMaster, "staffId")
  // Staff: ContactMaster;

  // @BelongsTo(() => User)
  // User: User;

  // @BelongsTo(() => CompanyMaster)
  // CompanyMaster: CompanyMaster;

  @BelongsTo(() => ProductMaster, {
    foreignKey: "productId",
    targetKey: "id",
    constraints: false,
  })
  productDetails: ProductMaster;

  // @BelongsTo(() => BomMaster)
  // bomDetails: BomMaster;

  @BelongsTo(() => LocationMaster, {
    foreignKey: "consumptionLocationId",
    targetKey: "id",
    constraints: false,
  })
  consumptionLocation: LocationMaster;

  @BelongsTo(() => LocationMaster, {
    foreignKey: "productionLocationId",
    targetKey: "id",
    constraints: false,
  })
  productionLocation: LocationMaster;

  // @BelongsTo(() => LocationMaster, "consumptionLocationId")
  // ConsumptionLocation: LocationMaster;

  // @BelongsTo(() => LocationMaster, "productionLocationId")
  // ProductionLocation: LocationMaster;

  @HasMany(() => ProductionItems, {
    onDelete: "CASCADE",
    as: "allProductionItems",
  })
  allProductionItems: ProductionItems[];

  @HasMany(() => ProductionItems, {
    onDelete: "CASCADE",
    scope: {
      type: "composite",
    },
    as: "compositeProductionItems",
  })
  compositeProductionItems: ProductionItems[];

  @HasMany(() => ProductionItems, {
    onDelete: "CASCADE",
    scope: {
      type: "wastage",
    },
    as: "wastageProductionItems",
  })
  wastageProductionItems: ProductionItems[];

  @HasMany(() => ProductionItems, {
    onDelete: "CASCADE",
    scope: {
      type: "product",
    },
    as: "productProductionItems",
  })
  productProductionItems: ProductionItems[];

  @Column({
    type: DataType.VIRTUAL,
    get(this: ProductionMaster) {
      return this.batchQuantity * this.productionQuantity;
    },
  })
  totalQuantity: number;
}
