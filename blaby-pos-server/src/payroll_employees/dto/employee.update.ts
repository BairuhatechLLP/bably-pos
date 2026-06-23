import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeCategoryDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly firstName: string;
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly lastName: string;
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly employeeNumber: string;
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly eircode: string;
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly phone: string;
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly email: string;
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly fullAddress: string;
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly Designation: string;
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly accountHolderName: string;
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly accountNumber: string;
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly branch: string;
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly IFSC: string;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly salaryPackage: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly createdBy: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly companyid: number;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly date_of_join: Date;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly employeeGroup: number;
}
