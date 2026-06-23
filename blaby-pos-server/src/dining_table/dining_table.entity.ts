import {
    AutoIncrement,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    HasOne,
    Model,
    PrimaryKey,
    Table,
    Unique
} from "sequelize-typescript";
import { CompanyMaster } from "../company_master/company_master_entity";
import { OrderMaster } from "../order_master/order_master.entity";
  
  export enum TableStatus {
    AVAILABLE = "AVAILABLE",
    OCCUPIED = "OCCUPIED",
    RESERVED = "RESERVED",
    MAINTENANCE = "MAINTENANCE",
    CLEANING = "CLEANING"
  }
  
  export enum TableSection {
    GROUND_FLOOR = "GROUND_FLOOR",
    FIRST_FLOOR = "FIRST_FLOOR",
    TERRACE = "TERRACE",
    GARDEN = "GARDEN",
    VIP = "VIP",
    BAR_AREA = "BAR_AREA",
    OUTDOOR = "OUTDOOR"
  }
  
  @Table({
    tableName: "dining_table",
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['table_number', 'company_id'],
      },
    ],
  })
  export class DiningTable extends Model<DiningTable> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;
  
    @Column({
      type: DataType.STRING(50),
      allowNull: false,
    })
    table_number: string;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 50
      }
    })
    capacity: number;
  
    @Column({
      type: DataType.ENUM(...Object.values(TableStatus)),
      defaultValue: TableStatus.AVAILABLE
    })
    status: TableStatus;
  
    @Column({
      type: DataType.ENUM(...Object.values(TableSection)),
      allowNull: false
    })
    section: TableSection;

    @Column(DataType.BIGINT)
    admin_id: number;
  
    @ForeignKey(() => CompanyMaster)
    @Column({
      type: DataType.BIGINT,
      allowNull: false
    })
    company_id: number;
  
    @BelongsTo(() => CompanyMaster)
    companyInfo: CompanyMaster;
  
    @HasOne(() => OrderMaster)
    orders: OrderMaster[];
  }