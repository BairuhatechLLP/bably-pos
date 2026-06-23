import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLocationDto {
  @IsOptional()
  @ApiProperty()
  readonly location: string;

  @IsOptional()
  @ApiProperty()
  readonly locationCode: string;

  @IsOptional()
  @ApiProperty()
  readonly companyid: number;

  @IsOptional()
  @ApiProperty()
  readonly isDeleted: boolean;
}
