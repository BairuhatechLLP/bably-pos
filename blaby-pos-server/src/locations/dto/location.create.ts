import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty() readonly location: string;
  @ApiProperty() readonly locationCode: string;
  @ApiProperty() readonly userid: number;
  @ApiProperty() readonly companyid: number;
}
