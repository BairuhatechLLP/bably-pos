import { ApiProperty } from "@nestjs/swagger";
import { StockTransfer } from "../stock_transfer.entity";
import { Charges, Details } from "./createStockTransfer.dto";

export class StockTransferDto {
  @ApiProperty()
  readonly id: number;

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
  readonly itemDetails: Details[];

  
  @ApiProperty()
  readonly charges: Charges[];
  
  @ApiProperty()
  readonly totalQuantity: number;

  @ApiProperty()
  readonly totalCharge: number;

  @ApiProperty()
  readonly totalAmount: number;

  constructor(tmp: StockTransfer) {
    this.id = tmp.id;
    this.seriesNo = tmp.seriesNo;
    this.voucherNo = tmp.voucherNo;
    this.locationFrom = tmp.locationFrom;
    this.locationTo = tmp.locationTo;
    this.transferDate = tmp.transferDate;
    this.reference = tmp.reference;
    this.companyId = tmp.companyId;
    this.adminId = tmp.adminId;
    this.itemDetails = tmp.itemDetails;
    this.charges = tmp.charges;
    this.totalQuantity = tmp.totalQuantity;
    this.totalCharge = tmp.totalCharge;
    this.totalAmount = tmp.totalAmount
  }
}
