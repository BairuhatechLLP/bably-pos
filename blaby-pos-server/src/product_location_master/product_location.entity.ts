import {
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
  } from 'sequelize-typescript';

  import { LocationMaster } from '../locations/location.entity';
import { ProductMaster } from '../product_master/product_master';
  
  @Table({
    tableName: 'product_location_master',
  })
  export class ProductLocationMaster extends Model<ProductLocationMaster> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;
  
    @Column(DataType.STRING(200)) productName: string;

    @ForeignKey(() => ProductMaster)
    @Column(DataType.BIGINT)
    productId?: number;
    @BelongsTo(() => ProductMaster)
    productDetails: ProductMaster;

    @Column(DataType.BIGINT) stock: number;

    @Column(DataType.STRING(200)) locationName: string;
  
    @ForeignKey(() => LocationMaster)
    @Column(DataType.BIGINT)
    locationId: number;
    @BelongsTo(() => LocationMaster)
    locationDetails: LocationMaster;

    @Column(DataType.BIGINT) adminid: number;
    @Column(DataType.BIGINT) companyid: number;
  
    @CreatedAt
    @Column({ field: 'createdat' })
    created_at: Date;
  
    @UpdatedAt
    @Column({ field: 'updatedat' })
    updated_at: Date;
  }
  