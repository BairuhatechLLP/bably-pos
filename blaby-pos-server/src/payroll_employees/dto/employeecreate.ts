import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDate, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty() @IsString() readonly firstName: string;
  @ApiProperty() @IsString() readonly lastName: string;
  @ApiProperty() @IsString() readonly employeeNumber: string;
  @ApiProperty() @IsString() readonly eircode: string;
  @ApiProperty() @IsString() readonly phone: string;
  @ApiProperty() @IsString() readonly email: string;
  @ApiProperty() @IsString() readonly fullAddress: string;
  @ApiProperty() @IsString() readonly Designation: string;
  @ApiProperty() @IsString() @IsOptional() readonly accountHolderName: string;
  @ApiProperty() @IsString() @IsOptional() readonly accountNumber: string;
  @ApiProperty() @IsString() @IsOptional() readonly branch: string;
  @ApiProperty() @IsString() @IsOptional() readonly IFSC: string;
  @ApiProperty() @IsNumber() @IsOptional() readonly adminId: number;

  @ApiProperty() @IsNumber() readonly employeeGroup: number;
  @ApiProperty() @IsNumber() readonly salaryPackage: number;
  @ApiProperty() @IsNumber() readonly companyid: number;
  @ApiProperty() @IsNumber() readonly createdBy: number;

  @ApiProperty() readonly date_of_join: any;
}
