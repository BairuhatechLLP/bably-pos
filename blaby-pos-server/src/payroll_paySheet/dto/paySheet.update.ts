import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional,IsArray } from 'class-validator';

export class UpdatePaySheetDto {
  
  @ApiProperty()
  @IsNumber()
  @IsOptional()
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
  @IsOptional()
  readonly totalDeduction: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly totalEarnings: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly companyid: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly adminId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly netSalary: number;
}
