import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
} from 'class-validator';

export class UpdateProductLocationDto {
  @ApiProperty() @IsOptional() readonly productName: number; 
  @ApiProperty() @IsOptional() readonly productId: string;
  @ApiProperty() @IsOptional() readonly locationId: number; 
  @ApiProperty() @IsOptional() readonly locationName: string;
  @ApiProperty() @IsOptional() readonly stock: number;
  @ApiProperty() @IsOptional() readonly adminid: number;
  @ApiProperty() @IsOptional() readonly companyid: number;
  @ApiProperty() @IsOptional() readonly is_deleted: boolean;
}