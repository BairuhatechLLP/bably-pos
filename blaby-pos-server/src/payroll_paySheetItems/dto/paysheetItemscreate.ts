import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDate, IsOptional } from 'class-validator';

export class CreatePaysheetItemsDto {
  @ApiProperty()
  @IsString()
  readonly calculationValue: string;

  @ApiProperty()
  @IsNumber()
  readonly paySheetId: number;

  @ApiProperty()
  @IsString()
  readonly calculationType: string;

  @ApiProperty()
  @IsString()
  readonly type: string;

  @ApiProperty()
  @IsString()
  readonly percentageof: string;

  @ApiProperty()
  @IsNumber()
  readonly adminId: number;

  constructor(dto: CreatePaysheetItemsDto) {
    this.calculationValue = dto.calculationValue;
    this.paySheetId = dto.paySheetId;
    this.calculationType = dto.calculationType;
    this.type = dto.type;
    this.percentageof = dto.percentageof;
    this.adminId = dto.adminId;
  }
}
