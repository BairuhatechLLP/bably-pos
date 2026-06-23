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
} from "sequelize-typescript";
import { LocationMaster } from "../locations/location.entity";
import { Charges, Details } from "./dto/createStockTransfer.dto";

@Table({
  tableName: "stock_transfer",
})
export class StockTransfer extends Model<StockTransfer> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => LocationMaster)
  @Column(DataType.BIGINT)
  seriesNo: number;
  @BelongsTo(() => LocationMaster,'seriesNo')
  locationDetails: LocationMaster;

  @Column(DataType.STRING(10))
  voucherNo: string;

  @ForeignKey(() => LocationMaster)
  @Column(DataType.BIGINT)
  locationFrom: number;
  @BelongsTo(() => LocationMaster,'locationFrom')
  locationFromDetails: LocationMaster;

  @ForeignKey(() => LocationMaster)
  @Column(DataType.BIGINT)
  locationTo: number;
  @BelongsTo(() => LocationMaster,'locationTo')
  locationToDetails: LocationMaster;

  @Column(DataType.DATE)
  transferDate: Date;

  @Column(DataType.BIGINT)
  companyId: number;

  @Column(DataType.BIGINT)
  adminId: number;

  @Column(DataType.STRING(250))
  reference: string;

  @Column({ type: DataType.JSON })
  itemDetails: Details[];

  @Column({ type: DataType.JSON })
  charges: Charges[];
  
  @Column(DataType.BIGINT)
  totalQuantity: number;

  @Column(DataType.BIGINT)
  totalCharge: number;

  @Column(DataType.BIGINT)
  totalAmount: number;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;
}
