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
    tableName: 'stripe_log',
  })
  export class StripeLog extends Model<StripeLog> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;
  
    @Column(DataType.BIGINT)
    invoiceId: number;
    @Column(DataType.STRING(200))
    invoiceNo: string;

    @Column(DataType.STRING(250))
    stripeId: string;

    @Column(DataType.STRING(250))
    paymentFor: string;

    @Column(DataType.BIGINT)
    adminid: number;

    @Column(DataType.BIGINT)
    amount: number;

    @Column(DataType.BIGINT)
    companyid: number;

    @Column(DataType.STRING(250)) 
    status: string;

    @Column(DataType.DATE) 
    date: Date;

    @Column(DataType.BIGINT)
    staffTransactionId: number;

    @Column(DataType.BIGINT)
    subscriptionPlan: number;
  
    @CreatedAt
    @Column({ field: 'created_at' })
    createdAt: Date;
  
    @UpdatedAt
    @Column({ field: 'updated_at' })
    updatedAt: Date;

  }
  