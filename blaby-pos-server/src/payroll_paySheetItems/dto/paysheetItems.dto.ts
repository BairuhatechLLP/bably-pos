import { ApiProperty } from '@nestjs/swagger';
import { PayrollPaySheetItem } from '../paysheetItemsEntity';

export class PayrollPaySHeetItemDTO {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly calculationValue: string;

  @ApiProperty()
  readonly paySheetId: number;

  @ApiProperty()
  readonly calculationType: string;

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly persentageof: string;

  @ApiProperty()
  readonly adminId: number;

  @ApiProperty()
  readonly created_at: Date;

  @ApiProperty()
  readonly updated_at: Date;

  constructor(paySheetItem: PayrollPaySheetItem) {
    this.id = paySheetItem.id;
    this.calculationValue = paySheetItem.calculationValue;
    this.paySheetId = paySheetItem.paySheetId;
    this.calculationType = paySheetItem.calculationType;
    this.type = paySheetItem.type;
    this.persentageof = paySheetItem.percentageof;
    this.adminId = paySheetItem.adminId;
    this.created_at = paySheetItem.create_at;
    this.updated_at = paySheetItem.updated_At;
  }
}
