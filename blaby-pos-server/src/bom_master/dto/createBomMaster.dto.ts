import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from "class-validator";
export class BomItemDto {
  @ApiProperty()
  @IsNumber()
  readonly productId: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  readonly quantity: number;

  @ApiProperty()
  @IsIn(["composite", "byProduct"], {
    message: "Invalid BOM Type",
  })
  readonly type: string;
}
export class CreateBomItemDto {
  @ApiProperty()
  @IsNumber()
  readonly productId: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  readonly quantity: number;
}
export class CreateBomDto {
  @ApiProperty()
  @IsNumber()
  readonly companyId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly staffId: number;

  @ApiProperty()
  @IsIn(["admin", "staff"], {
    message: "Invalid User Type",
  })
  readonly createdBy: string;

  @ApiProperty()
  @IsNumber()
  readonly productId: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  readonly quantity: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly consumption_location: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly production_location: number;

  @ApiProperty({
    type: [CreateBomItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBomItemDto)
  consumerItems: CreateBomItemDto[];

  @ApiProperty({
    type: [CreateBomItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBomItemDto)
  byproductItems: CreateBomItemDto[];
}
