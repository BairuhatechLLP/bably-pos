import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Contractors } from '../../shared/constants/constants';

export class UpdateSupplierDto {
  @IsOptional() @ApiProperty() @IsString() readonly name: string;
  @IsOptional() @ApiProperty() @IsString() readonly bus_name: string;
  @IsOptional() @ApiProperty() @IsString() readonly email: string;
  @IsOptional() @ApiProperty() @IsString() readonly mobile: string;
  @IsOptional() @ApiProperty() @IsString() readonly telephone: string;
  @IsOptional() @ApiProperty() @IsString() readonly address: string;
  @IsOptional() @ApiProperty() @IsString() readonly city: string;
  @IsOptional() @ApiProperty() readonly postcode: string;
  @IsOptional() @ApiProperty() @IsString() readonly acc_default: string;
  @IsOptional() @ApiProperty() @IsString() readonly notes: string;
  @IsOptional() @ApiProperty() @IsString() readonly reference: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly userid: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly adminid: number;
  @IsOptional() @ApiProperty() @IsDate() readonly userdate: Date;
  @IsOptional() @ApiProperty() @IsBoolean() readonly active: boolean;
  @IsOptional() @ApiProperty() @IsString() readonly vat_number: string;
  @IsOptional() @ApiProperty() @IsString() readonly note: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly opening_balance: number;
  @IsOptional() @ApiProperty()@IsEnum(Contractors)readonly type: Contractors;
  @IsOptional() @ApiProperty() @IsString() readonly password: string;
  @IsOptional() @ApiProperty() @IsString() readonly staffId: string;
  @IsOptional() @ApiProperty() @IsString() readonly image: string;
  @IsOptional() @ApiProperty() @IsString() readonly access: string;
  @IsOptional() @ApiProperty() @IsString() readonly country: string;
  @IsOptional() @ApiProperty() @IsString() readonly state: string;
  @IsOptional() @ApiProperty() @IsNumber() readonly createdBy: number;
  @IsOptional() @ApiProperty() @IsNumber() readonly companyid: number;

  @ApiProperty() @IsOptional() readonly loyaltyCardNumber: string;
  @ApiProperty() @IsOptional() readonly loyaltyPoints: number;
  @ApiProperty() @IsOptional() readonly referralCount: number;
  @ApiProperty() @IsOptional() readonly referralPoint: number;
}
