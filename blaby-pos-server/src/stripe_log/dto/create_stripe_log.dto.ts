import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateStripeLogDto{
  
    @ApiProperty()
    readonly invoiceId: number;
  
    @ApiProperty()
    readonly stripeId: string;

    @ApiProperty()
    readonly invoiceNo: string;

    @ApiProperty()
    readonly amount: number;

    @ApiProperty()
    readonly companyid: number;
  
    @ApiProperty()
    readonly adminid: number;

    @ApiProperty()
    readonly subscriptionPlan?: number;

    @ApiProperty()
    readonly status: string;

    @ApiProperty()
    readonly staffTransactionId: number;
    
    @ApiProperty()
    readonly date: Date; 

}
