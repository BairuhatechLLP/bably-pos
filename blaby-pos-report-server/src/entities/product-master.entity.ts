import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ProductCategory } from './product-category.entity';

@Table({
  tableName: 'product_master',
  timestamps: true,
  createdAt: 'createdat',
  updatedAt: 'updatedat',
})
export class ProductMaster extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    field: 'idescription',
  })
  declare idescription: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  declare barcode: string;

  @Column({
    type: DataType.DECIMAL(11, 2),
    allowNull: true,
    field: 'sp_price',
  })
  declare sp_price: number;

  @Column({
    type: DataType.DECIMAL(11, 2),
    allowNull: true,
    field: 'costprice',
  })
  declare costprice: number;

  @Column({
    type: DataType.DECIMAL(11, 2),
    allowNull: true,
    field: 'rate',
  })
  declare rate: number;

  @Column({
    type: DataType.DECIMAL(11, 2),
    allowNull: true,
    field: 'price',
  })
  declare price: number;

  @Column({
    type: DataType.DECIMAL(11, 2),
    allowNull: true,
    field: 'c_price',
  })
  declare c_price: number;

  @Column({
    type: DataType.DECIMAL(11, 2),
    allowNull: true,
    field: 'stock',
  })
  declare stock: number;

  @ForeignKey(() => ProductCategory)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
    field: 'product_category',
  })
  declare product_category: number;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    field: 'pimage',
  })
  declare pimage: string;

  @Column({
    type: DataType.TINYINT,
    allowNull: true,
  })
  declare active: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  declare adminid: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  declare userid: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  declare companyid: number;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  declare itemtype: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  declare icode: string;

  @Column({
    type: DataType.TINYINT,
    allowNull: true,
    field: 'is_deleted',
  })
  declare is_deleted: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare createdat: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare updatedat: Date;

  @BelongsTo(() => ProductCategory, 'product_category')
  productCategory: ProductCategory;
}
