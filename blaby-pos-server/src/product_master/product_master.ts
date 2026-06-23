import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { User } from "../users/user.entity";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { unit } from "../units/unit.entity";
import { ProductCategory } from "../product_category/product_category_entity";
import { OrderItems } from "../order_items/order_items.entity";
import { BomMaster } from "../bom_master/bom_master.entity";
import { BomItems } from "../bom_items/bom_items.entity";
import { ProductionMaster } from "../production_master/production_master.entity";
import { ProductionItems } from "../production_items/production_items.entity";

@Table({
  tableName: "product_master",
})
export class ProductMaster extends Model<ProductMaster> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userid?: number;
  @BelongsTo(() => User)
  user: User;

  @Column(DataType.BOOLEAN)
  active?: boolean;
  @Column(DataType.STRING(200)) itemtype: string;
  @Column(DataType.STRING(200)) icode: string;
  @Column(DataType.STRING(200)) idescription: string;
  @Column(DataType.STRING(200)) variant_name: string;

  @ForeignKey(() => ContactMaster)
  @Column(DataType.BIGINT)
  spname: number;
  @BelongsTo(() => ContactMaster)
  supplier: ContactMaster;

  @Column(DataType.BIGINT) ledgercategory: number;
  @Column(DataType.STRING(200)) svrate: string;
  @Column(DataType.STRING(200)) sicode: string;
  @Column(DataType.STRING(200)) pdescription: string;
  @Column(DataType.STRING(200)) pvrate: string;
  @Column(DataType.BIGINT) paccount: number;
  @Column(DataType.STRING(200)) barcode: string;
  @Column(DataType.STRING(200)) weight: string;
  @Column(DataType.STRING(200)) notes: string;
  @Column(DataType.STRING(200)) name: string;
  @Column(DataType.STRING(200)) ptype: string;
  @Column(DataType.STRING(200)) reason: string;
  @Column(DataType.STRING(200)) userdate: Date;
  @Column(DataType.STRING(200)) pimage: string;
  @Column(DataType.DATE) qdate: Date;
  @Column(DataType.DATE) date: Date;
  @Column(DataType.DATE) expiredate: Date;
  @Column(DataType.DECIMAL(11, 2)) trade_price: number;
  @Column(DataType.DECIMAL(11, 2)) wholesale: number;
  @Column(DataType.DECIMAL(11, 2)) rate: number;
  @Column(DataType.DECIMAL(11, 2)) quantity: number;
  @Column(DataType.DECIMAL(11, 2)) stockquantity: number;
  @Column(DataType.DECIMAL(11, 2)) qtype: number;
  @Column(DataType.DECIMAL(11, 2)) vatamt: number;
  @Column(DataType.DECIMAL(11, 2)) includevat: number;
  @Column(DataType.DECIMAL(11, 2)) price: number;
  @Column(DataType.DECIMAL(11, 2)) costprice: number;
  @Column(DataType.DECIMAL(11, 2)) rlevel: number;
  @Column(DataType.BIGINT) rquantity: number;
  @Column(DataType.DECIMAL(11, 2)) sp_price: number;
  @Column(DataType.BIGINT) stock: number;
  @Column(DataType.BIGINT) cquantity: number;
  @Column(DataType.DECIMAL(11, 2)) c_price: number;
  @Column(DataType.BIGINT) saccount: number;
  @Column(DataType.BIGINT) increase: number;
  @Column(DataType.BIGINT) decrease: number;
  @Column(DataType.BIGINT) netquantity: number;
  @Column(DataType.BIGINT) adminid: number;
  @Column(DataType.BIGINT) vat: number;
  @Column(DataType.STRING(200)) location: string;
  @Column(DataType.BIGINT) createdBy: number;
  @Column(DataType.BIGINT) companyid: number;
  @Column(DataType.STRING(200)) hsn_code: string;
  @Column(DataType.BOOLEAN) is_deleted: boolean;

  @Column(DataType.BOOLEAN) is_direct_billing: boolean;
  @Column(DataType.BIGINT) parcel_charge: number;
  @Column(DataType.DECIMAL(11, 2)) taxable_amount: number;

  @ForeignKey(() => unit)
  @Column(DataType.BIGINT)
  unit: number;
  @BelongsTo(() => unit)
  unitDetails: unit;

  @ForeignKey(() => ProductCategory)
  @Column(DataType.BIGINT)
  product_category: number;
  @BelongsTo(() => ProductCategory)
  productCategory: ProductCategory;

  @CreatedAt
  @Column({ field: "createdat" })
  created_at: Date;

  @UpdatedAt
  @Column({ field: "updatedat" })
  updated_at: Date;

  @HasMany(() => OrderItems)
  orderItems: OrderItems[];

  @HasMany(() => BomMaster, {
    foreignKey: "productId",
    onDelete: "CASCADE",
  })
  bomMaster: BomMaster[];

  @HasMany(() => BomItems, {
    foreignKey: "productId",
    onDelete: "CASCADE",
  })
  BomItems: BomItems[];
  @HasMany(() => ProductionMaster, {
    foreignKey: "productId",
    constraints: false,
  })
  ProductionMaster: ProductionMaster[];

  @HasMany(() => ProductionItems, {
    foreignKey: "productId",
    constraints: false,
  })
  ProductionItems: ProductionItems[];
}
