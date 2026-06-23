import { ApiProperty } from '@nestjs/swagger';
import { StripeLog } from '../stripe_log.entity';

export class StripeLogDto {

  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly invoiceId: number;

  @ApiProperty()
  readonly stripeId: string;

  @ApiProperty()
  readonly status: string;
  
  @ApiProperty()
  readonly invoiceNo: string;

  @ApiProperty()
  readonly amount: number;

  @ApiProperty()
  readonly companyid: number;

  @ApiProperty()
  readonly adminid: number;
  
  @ApiProperty()
  readonly date: Date; 

  @ApiProperty()
  readonly subscriptionPlan: number;

  @ApiProperty()
  readonly staffTransactionId: number;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;


  constructor(tmp: StripeLog) {
    this.id = tmp.id;
    this.invoiceId = tmp.invoiceId;
    this.stripeId = tmp.stripeId;
    this.amount = tmp.amount;
    this.invoiceNo = tmp.invoiceNo;
    this.staffTransactionId = tmp.staffTransactionId;
    this.invoiceNo = tmp.invoiceNo;
    this.stripeId = tmp.stripeId;
    this.subscriptionPlan = tmp.subscriptionPlan;
    this.status = tmp.status;
    this.date = tmp.date;
    this.adminid = tmp.adminid;
    this.companyid = tmp.companyid;
    this.createdAt = tmp.createdAt;
    this.updatedAt = tmp.updatedAt;
  }
}
