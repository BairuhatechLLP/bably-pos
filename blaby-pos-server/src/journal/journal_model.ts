import {
    AutoIncrement,
    Column,
    CreatedAt,
    UpdatedAt,
    DataType,
    Model,
    PrimaryKey,
    Table,
    BelongsTo,
    ForeignKey,
} from 'sequelize-typescript';
import { User } from "./../users/user.entity"

@Table({
    tableName: 'journal_master',
})
export class Journal extends Model<Journal> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;

    @Column(DataType.STRING(1000))
    reference: string;

    @Column(DataType.STRING(1000))
    description: string;

    @Column(DataType.FLOAT(11, 2))
    total: number;

    @ForeignKey(() => User)
    @Column(DataType.BIGINT)
    userid?: number;
    @BelongsTo(() => User)
    user: User

    @Column(DataType.BIGINT)
    adminid?: number;

    @Column(DataType.DATE)
    userdate?: Date;

    @CreatedAt
    @Column({ field: 'createdat' })
    createdat: Date;
    @UpdatedAt
    @Column({ field: 'updatedat' })
    updatedat: Date;
    
    @Column(DataType.BOOLEAN) is_deleted: boolean;

    @Column(DataType.BIGINT)
    createdBy?: number;

    @Column(DataType.BIGINT)
    companyid?: number;
}
