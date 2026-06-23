import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateEmployeeCategoryDto {
  @ApiProperty() @IsString() readonly category: string;
  @ApiProperty() @IsNumber() readonly userid: number;
  @ApiProperty() @IsNumber() readonly companyid: number;
}
