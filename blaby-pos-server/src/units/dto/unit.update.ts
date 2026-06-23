import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { UnitDto } from './unit.dto';

export class UpdateUnitDto {
  @ApiProperty()
  readonly id: number;
  @ApiProperty()
  readonly unit: number;
  @ApiProperty()
  readonly formalName: string;
  @ApiProperty()
  @IsInt({ message: 'Decimal value must be an integer' })
  @Min(0, { message: 'Decimal value must be zero or a positive integer' })
  readonly decimalValues: number;
  @ApiProperty()
  readonly isDeleted: boolean;
}
