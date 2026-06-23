import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from "class-validator";

export class UpdateBomItemDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly id: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  productId: number;
}

export class UpdateBomMasterDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  companyId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  productId: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  @IsPositive()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  consumption_location: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  production_location: number;

  @ApiProperty({
    type: [UpdateBomItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBomItemDto)
  @IsOptional()
  consumerItems: UpdateBomItemDto[];

  @ApiProperty({
    type: [UpdateBomItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBomItemDto)
  @IsOptional()
  byproductItems: UpdateBomItemDto[];
}
