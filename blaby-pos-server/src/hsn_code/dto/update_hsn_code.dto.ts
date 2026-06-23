import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateHsnCodeDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly hsn_code: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly description: string;

  @IsOptional()
  @ApiProperty()
  readonly adminid: number;

  @IsOptional()
  @ApiProperty() 
  readonly companyid: number;
}
