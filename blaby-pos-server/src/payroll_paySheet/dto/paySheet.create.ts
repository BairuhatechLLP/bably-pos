import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsDate,
  IsObject,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreatePaySheetDto {
  @ApiProperty()
  @IsNumber()
  readonly employeeId: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  readonly earnings: any;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  readonly deduction: any;

  @ApiProperty()
  @IsNumber()
  readonly totalDeduction: number;

  @ApiProperty()
  @IsNumber()
  readonly totalEarnings: number;

  @ApiProperty()
  @IsNumber()
  readonly adminId: number;

  @ApiProperty()
  @IsNumber()
  readonly netSalary: number;

  @ApiProperty()
  @IsNumber()
  readonly companyid: number;
}
