import { ApiProperty } from '@nestjs/swagger';
import { Length, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateTaxMasterDto {
  @ApiProperty()
  @IsString()
  readonly type: string;

  @ApiProperty()
  @IsNumber()
  readonly percentage: number;

  @ApiProperty()
  @IsNumber()
  readonly adminid: number;

  @ApiProperty()
  @IsNumber()
  readonly companyid: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly countryid: number;
}
