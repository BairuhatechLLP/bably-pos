import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateStripeLogDto {
  
 @IsOptional()
  @ApiProperty()
  readonly invoiceId: number;

  @IsOptional()
  @ApiProperty()
  readonly stripeId: string;

  @IsOptional()
  @ApiProperty()
  readonly status: string;

  @IsOptional()
  @ApiProperty()
  readonly invoiceNo: string;

  @IsOptional()
  @ApiProperty()
  readonly amount: number;

  @IsOptional()
  @ApiProperty()
  readonly adminid: number;

  @IsOptional()
  @ApiProperty()
  readonly staffTransactionId: number;

  @IsOptional()
  @ApiProperty()
  readonly subscriptionPlan: number;

  @IsOptional()
  @ApiProperty()
  readonly companyid: number;

  @IsOptional()
  @ApiProperty()
  readonly date: Date; 
}
