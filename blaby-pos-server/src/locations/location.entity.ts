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
import { BomMaster } from "../bom_master/bom_master.entity";
import { ProductionMaster } from "../production_master/production_master.entity";

@Table({
  tableName: "location_master",
})
export class LocationMaster extends Model<LocationMaster> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(200)) location: string;
  @Column(DataType.STRING(10)) locationCode: string;
  @Column(DataType.INTEGER) adminId: number;
  @Column(DataType.INTEGER) companyid: number;
  @Column(DataType.BOOLEAN) isDeleted:boolean;

  @CreatedAt
  @Column({ field: "createdat" })
  create_at: Date;
  @UpdatedAt
  @Column({ field: "updatedat" })
  updated_At: Date;

  @HasMany(() => BomMaster, {
    foreignKey: "consumption_location",
    onDelete: "SET NULL",
  })
  consumptionBomMaster: BomMaster[];

  @HasMany(() => BomMaster, {
    foreignKey: "production_location",
    onDelete: "SET NULL",
  })
  productionBomMaster: BomMaster[];

  @HasMany(() => ProductionMaster, {
    foreignKey: "consumptionLocationId",
    constraints: false,
  })
  consumptionLocationProductionMaster: ProductionMaster[];

  @HasMany(() => ProductionMaster, {
    foreignKey: "productionLocationId",
    constraints: false,
  })
  productionLocationProductionMaster: ProductionMaster[];
}
