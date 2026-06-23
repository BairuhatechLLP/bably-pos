import { ApiProperty } from '@nestjs/swagger';

export class Details {
    @ApiProperty()
    readonly qty: number;
  
    @ApiProperty()
    readonly unit: string;
  
    @ApiProperty()
    readonly price: number;
  
    @ApiProperty()
    readonly total: number;
  
    @ApiProperty()
    readonly productId: number;
  
    @ApiProperty()
    readonly productName: string;
  }

  export class Charges {
    @ApiProperty()
    readonly amount: number;
  
    @ApiProperty()
    readonly ledgerId: number;

    @ApiProperty()
    readonly paidFrom: number;

    @ApiProperty()
    readonly ledgerName: string;

    @ApiProperty()
    readonly paidBank: string;
  
    @ApiProperty()
    readonly notes: string;
  }

export class CreateStockTransferDto{
  
    @ApiProperty()
    readonly seriesNo: number;
  
    @ApiProperty()
    readonly voucherNo: string;
  
    @ApiProperty()
    readonly locationFrom: number;
  
    @ApiProperty()
    readonly locationTo: number;
  
    @ApiProperty()
    readonly transferDate: Date;
  
    @ApiProperty()
    readonly reference: string;

    @ApiProperty()
    readonly companyId: number;

    @ApiProperty()
    readonly adminId: number;

    @ApiProperty()
    readonly totalQuantity: number;

    @ApiProperty()
    readonly totalCharge: number;

    @ApiProperty()
    readonly totalAmount: number;
  
    @ApiProperty({ type: [Details] })
    readonly itemDetails: Details[];

    @ApiProperty({ type: [Charges] })
    readonly charges: Charges[];
}



