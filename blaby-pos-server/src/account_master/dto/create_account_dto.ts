import { ApiProperty } from '@nestjs/swagger';
import {
  Length,
  IsString,
  IsBoolean,
  IsNumber,
  IsDate,
  IsOptional,
} from 'class-validator';

export class CreateAccountDto {
  @ApiProperty() @IsNumber() readonly userid: number;

  @ApiProperty() @IsString() readonly nominalcode: string;
  @ApiProperty() @IsString() readonly laccount: string;

  @ApiProperty() @IsNumber() readonly adminid: number;
  @ApiProperty() @IsNumber() readonly type: number;
  @ApiProperty() @IsString() readonly logintype: string;
  @ApiProperty() @IsNumber() readonly category: number;
  @ApiProperty() @IsNumber() readonly categorygroup: number;

  @ApiProperty() @IsNumber() readonly journals: string;
  @ApiProperty() @IsNumber() readonly purchase: string;
  @ApiProperty() @IsNumber() readonly sales: string;
  @ApiProperty() @IsNumber() @IsOptional() readonly createdBy: number;
  @ApiProperty() @IsNumber() @IsOptional() readonly companyid: number;
  @ApiProperty() @IsNumber() @IsOptional() readonly calculationPeriod: number;
  @ApiProperty() @IsString() @IsOptional() readonly payheadType: string;
  @ApiProperty() @IsString() @IsOptional() readonly acctype: string;
  @ApiProperty() @IsString() @IsOptional() readonly branch: string;
  @ApiProperty() @IsString() @IsOptional() readonly ifsc: string;
  @ApiProperty() @IsString() @IsOptional() readonly accountname: string;


}
