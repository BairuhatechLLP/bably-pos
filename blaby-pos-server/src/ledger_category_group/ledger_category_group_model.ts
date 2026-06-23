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
    HasMany,
    ForeignKey,
} from 'sequelize-typescript';


@Table({
    tableName: 'ledger_category_group',
})
export class LedgerCategoryGroup extends Model<LedgerCategoryGroup> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;

    @Column(DataType.STRING(1000))
    categorygroup: string;


    @CreatedAt
    @Column({ field: 'createdat' })
    createdat: Date;
    @UpdatedAt
    @Column({ field: 'updatedat' })
    updatedat: Date;
}
