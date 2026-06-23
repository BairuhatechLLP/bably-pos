import {
    AutoIncrement,
    Column,
    DataType,
    Model,
    PrimaryKey,
    Table
} from "sequelize-typescript";

@Table({
  tableName: "kitchen_display",
})
export class KitchenDisplay extends Model<KitchenDisplay> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING(255))
  name: string;

  @Column(DataType.BIGINT)
  admin_id: number;

  @Column(DataType.BIGINT)
  company_id: number;
}
