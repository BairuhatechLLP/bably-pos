import { AutoIncrement, BelongsTo, Column, CreatedAt, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";
import { CounterDetails } from "../counter_details/counter_details_entity";
import { LocationMaster } from "../locations/location.entity";

@Table({ tableName: 'billing_counter' })
export class BillingCounter extends Model<BillingCounter> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;

    @Column(DataType.BIGINT)
    adminid: number;

    @Column(DataType.BIGINT)
    companyid: number;

    @Column(DataType.STRING(100))
    name: string;

    @Column(DataType.DECIMAL(11, 2))
    balance: number;

    @Column(DataType.DATE)
    sdate: Date;

    @Column(DataType.JSON)
    shiftlist: object;

    @Column(DataType.JSON)
    denomination: object;

    @ForeignKey(() => LocationMaster)
    @Column(DataType.BIGINT)
    location: number;
    @BelongsTo(() => LocationMaster)
    locationDetails: LocationMaster;

    @HasMany(() => CounterDetails)
    user_details: CounterDetails;

    @CreatedAt
    @Column({ field: 'createdat' })
    created_at: Date;

    @UpdatedAt
    @Column({ field: 'updatedat' })
    updated_at: Date;
}