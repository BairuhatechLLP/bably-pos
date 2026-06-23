import { ApiProperty } from '@nestjs/swagger';
import { PayrollPaySheet } from '../paySheetEntity'; // Import correct path to PayrollPaySheet entity/model

export class PayrollPaySheetDTO {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly employeeId: number;

  @ApiProperty()
  readonly totalDeduction: number;

  @ApiProperty()
  readonly totalEarnings: number;

  @ApiProperty()
  readonly netSalary: number;

  @ApiProperty()
  readonly companyid: number;

  @ApiProperty()
  readonly create_at: Date;

  @ApiProperty()
  readonly updated_At: Date;

  constructor(paySheet: PayrollPaySheet) {
    this.id = paySheet.id;
    this.employeeId = paySheet.employeeId;
    this.totalDeduction = paySheet.totalDeduction;
    this.totalEarnings = paySheet.totalEarnings;
    this.netSalary = paySheet.netSalary;
    this.companyid = paySheet.companyid;
    this.create_at = paySheet.create_at;
    this.updated_At = paySheet.updated_At;
  }
}
