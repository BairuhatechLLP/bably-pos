import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Contractors } from '../../shared/constants/constants';

export class CreateSupplierDto {
  @ApiProperty({ example: 'thameem' }) @IsString() readonly name: string;

  @ApiProperty({ example: 'thengaKachodam' })
  @IsString()
  @IsOptional()
  readonly bus_name: string;

  @ApiProperty({ example: 'thameem@email.com' })
  @IsString()
  @IsOptional()
  readonly email: string;

  @ApiProperty({ example: '3276546754' }) @IsString() readonly mobile: string;

  @ApiProperty({ example: '7863786372' })
  @IsString()
  @IsOptional()
  readonly telephone: string;

  @ApiProperty({ example: 'sdvjdsjghdjhgd' })
  @IsString()
  @IsOptional()
  readonly address: string;

  @ApiProperty({ example: 'sdvjdsjghdjhgd' })
  @IsString()
  @IsOptional()
  readonly city: string;

  @ApiProperty({ example: 76556737562 })
   @IsString()
   @IsOptional()
  readonly postcode: string;

  @ApiProperty({ example: 'sdvjdsjghdjhgd' })
  @IsString()
  @IsOptional()
  readonly acc_default: string;

  @ApiProperty({ example: 'sdvjdsjghdjhgd' })
  @IsString()
  @IsOptional()
  readonly notes: string;

  @ApiProperty({ example: 'sdvjdsjghdjhgd' })
  @IsString()
  @IsOptional()
  readonly reference?: string;

  @ApiProperty({ example: 31 })
  @IsNumber()
  @IsOptional()
  readonly userid?: number;

  @ApiProperty({ example: 17 }) @IsNumber() readonly adminid: number;

  @ApiProperty({ example: 17 }) @IsNumber() readonly ledger_category?: number;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  readonly userdate: Date;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  readonly active?: boolean;

  @ApiProperty({ example: '43643544662' })
  @IsString()
  @IsOptional()
  readonly vat_number?: string;

  @ApiProperty({ example: 'supplier' })
  @IsEnum(Contractors)
  readonly type?: Contractors;

  @ApiProperty({ example: 100 }) @IsNumber()  @IsOptional() readonly opening_balance?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly password: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly staffId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly image: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly access?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly country: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly state: string;

  @ApiProperty({ example: 31 })
  @IsNumber()
  @IsOptional()
  readonly createdBy: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly companyid: number;
  
  @ApiProperty() @IsOptional() readonly loyaltyCardNumber: string;
  @ApiProperty() @IsOptional() readonly referredCode: string;
  @ApiProperty() @IsOptional() readonly loyaltyPoints: number;
  @ApiProperty() @IsOptional() readonly referralCount: number;
  @ApiProperty() @IsOptional() readonly referralPoint: number;
}
