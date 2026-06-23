import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, IsNumber, IsOptional, IsPositive } from "class-validator";

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

  @ApiProperty()
  @IsIn(["composite", "byProduct"], {
    message: "Invalid BOM Type",
  })
  readonly type: string;
}
