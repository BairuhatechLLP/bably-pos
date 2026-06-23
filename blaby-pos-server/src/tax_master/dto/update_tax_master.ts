import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateTaxMasterDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly type: string;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly percentage: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly countryid: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly adminid: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly companyid: number;
}
