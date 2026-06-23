import { AutoIncrement, BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";
import { BillingCounter } from "../billing_counter/billing_counter_entity";
import { ContactMaster } from "../contactMaster/contactMasterModel";

@Table({ tableName: 'counter_details' })
export class CounterDetails extends Model<CounterDetails> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;

    @Column(DataType.BIGINT)
    adminid: number;

    @Column(DataType.BIGINT)
    companyid: number;

    @ForeignKey(() => BillingCounter)
    @Column(DataType.BIGINT)
    counter_id: number;

    @BelongsTo(() => BillingCounter)
    counter: BillingCounter;

    @ForeignKey(() => ContactMaster)
    @Column(DataType.BIGINT)
    staffid: number;

    @BelongsTo(() => ContactMaster)
    staffdetails: ContactMaster;

    @Column(DataType.BIGINT)
    balance: number;

    @Column(DataType.BIGINT)
    short: number;

    @Column(DataType.BIGINT)
    closing_balance: number;

    @Column(DataType.DATE)
    sdate: Date;

    @Column(DataType.JSON)
    open_denomination: object;

    @Column(DataType.JSON)
    close_denomination: object;

    @Column(DataType.STRING(100))
    shift_type: string;

    @CreatedAt
    @Column({ field: 'createdat' })
    created_at: Date;

    @UpdatedAt
    @Column({ field: 'updatedat' })
    updated_at: Date;
}