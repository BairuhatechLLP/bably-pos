import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Charges, Details } from './createStockTransfer.dto';

export class UpdateStockTransferDto {
  
 @IsOptional()
  @ApiProperty()
  readonly seriesNo: number;

  @IsOptional()
  @ApiProperty()
  readonly voucherNo: string;

  @IsOptional()
  @ApiProperty()
  readonly locationFrom: number;

  @IsOptional()
  @ApiProperty()
  readonly locationTo: number;

  @IsOptional()
  @ApiProperty()
  readonly companyId: number;

  @IsOptional()
  @ApiProperty()
  readonly adminId: number;

  @IsOptional()
  @ApiProperty()
  readonly transferDate: Date;

  @IsOptional()
  @ApiProperty()
  readonly reference: string;

  @IsOptional()
  @ApiProperty()
  readonly itemDetails: Details[];

  @IsOptional()
  @ApiProperty()
  readonly charges: Charges[];
  
  @IsOptional()
  @ApiProperty()
  readonly totalQuantity: number;

  @IsOptional()
  @ApiProperty()
  readonly totalCharge: number;

  @IsOptional()
  @ApiProperty()
  readonly totalAmount: number;

}