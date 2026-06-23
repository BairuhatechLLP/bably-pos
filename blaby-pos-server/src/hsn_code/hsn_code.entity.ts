import {
    Table,
    PrimaryKey,
    Model,
    AutoIncrement,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
  } from 'sequelize-typescript';
  
  @Table({
    tableName: 'hsn_code_master',
  })
  export class HsnCode extends Model<HsnCode> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;
  
    @Column(DataType.STRING(200))
    hsn_code: string;

    @Column(DataType.STRING(250))
    description: string;

    @Column(DataType.BIGINT)
    adminid: number;

    @Column(DataType.BIGINT)
    companyid: number;
  
    @CreatedAt
    @Column({ field: 'created_at' })
    createdAt: Date;
  
    @UpdatedAt
    @Column({ field: 'updated_at' })
    updatedAt: Date;

  }
  