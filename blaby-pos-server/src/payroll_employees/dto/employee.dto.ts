import { ApiProperty } from '@nestjs/swagger';
import { PayrollEmployee } from '../employeeEntity';

export class PayrollEmployeeDTO {
  @ApiProperty()
  readonly id: number;
  @ApiProperty()
  readonly firstName: string;
  @ApiProperty()
  readonly lastName: string;
  @ApiProperty()
  readonly employeeNumber: string;
  @ApiProperty()
  readonly eircode: string;
  @ApiProperty()
  readonly phone: string;
  @ApiProperty()
  readonly fullAddress: string;
  @ApiProperty()
  readonly Designation: string;
  @ApiProperty()
  readonly accountHolderName: string;
  @ApiProperty()
  readonly accountNumber: string;
  @ApiProperty()
  readonly branch: string;
  @ApiProperty()
  readonly IFSC: string;
  @ApiProperty()
  readonly adminId: number;
  @ApiProperty()
  readonly employeeGroup: number;
  @ApiProperty()
  readonly salaryPackage: number;
  @ApiProperty()
  readonly createdBy: number;
  @ApiProperty()
  readonly companyid: number;
  @ApiProperty()
  readonly date_of_join: Date;
  @ApiProperty()
  readonly create_at: Date;
  @ApiProperty()
  readonly updated_At: Date;

  constructor(employee: PayrollEmployee) {
    this.id = employee.id;
    this.firstName = employee.firstName;
    this.lastName = employee.lastName;
    this.employeeNumber = employee.employeeNumber;
    this.eircode = employee.eircode;
    this.phone = employee.phone;
    this.fullAddress = employee.fullAddress;
    this.Designation = employee.Designation;
    this.accountHolderName = employee.accountHolderName;
    this.accountNumber = employee.accountNumber;
    this.branch = employee.branch;
    this.IFSC = employee.IFSC;
    this.adminId = employee.adminId;
    this.employeeGroup = employee.employeeGroup;
    this.salaryPackage = employee.salaryPackage;
    this.date_of_join = employee.date_of_join;
    this.create_at = employee.create_at;
    this.updated_At = employee.updated_At;
    this.createdBy = employee.createdBy;
    this.companyid = employee.companyid;
  }
}
