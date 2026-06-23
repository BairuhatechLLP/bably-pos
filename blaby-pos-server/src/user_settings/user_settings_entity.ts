import {
    Table,
    PrimaryKey,
    AutoIncrement,
    Column,
    DataType,
    Model,
    UpdatedAt,
    DeletedAt,
    CreatedAt,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript';
import { LocationMaster } from '../locations/location.entity';

@Table({
    tableName: 'user_settings',
})
export class UserSettings extends Model<UserSettings> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;

    @Column(DataType.BIGINT)
    adminid: number;

    @Column(DataType.BIGINT)
    companyid: number;

    @ForeignKey(() => LocationMaster)
    @Column(DataType.BIGINT)
    locationId: number;
    @BelongsTo(() => LocationMaster)
    locationDetails: LocationMaster;

    @Column(DataType.STRING(100)) type: string;
    @Column(DataType.JSON) value: string;
    @UpdatedAt
    @Column({ field: 'updated_at' })
    updatedAt?: Date;

    @CreatedAt
    @Column({ field: 'created_at' })
    createdAt?: Date;
}
