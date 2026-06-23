import { ApiProperty } from '@nestjs/swagger';
import { PayrollEmployeeCategory } from '../employeeCategoryEntity';

export class EmployeeCategoryDto {
  @ApiProperty()
  readonly id: number;
  @ApiProperty()
  readonly category: string;
  @ApiProperty()
  readonly userid: number;
  @ApiProperty()
  readonly companyid: number;
  @ApiProperty()
  readonly createdAt: Date;
  @ApiProperty()
  readonly updatedAt: Date;
  constructor(temp: PayrollEmployeeCategory) {
    this.id = temp.id;
    this.userid = temp.adminId;
    this.companyid = temp.companyid;
    this.createdAt = temp.create_at;
    this.updatedAt = temp.updatedAt;
  }
}
