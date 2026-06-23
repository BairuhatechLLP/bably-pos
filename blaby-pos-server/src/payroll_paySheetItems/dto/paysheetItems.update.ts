import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePaySheetItemDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  id?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  calculationValue?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  calculationType?: string;

  constructor(dto: UpdatePaySheetItemDto) {
    this.id = dto.id;
    this.calculationValue = dto.calculationValue;
    this.calculationType = dto.calculationType;
  }
}
