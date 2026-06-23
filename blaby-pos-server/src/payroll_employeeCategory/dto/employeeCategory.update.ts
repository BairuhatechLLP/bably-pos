import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeCategoryDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly category: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly companyid: string;
}
