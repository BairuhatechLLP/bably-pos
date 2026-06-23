import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, IsNumber, IsPositive } from "class-validator";

export class BomItemDto {
  @ApiProperty()
  @IsNumber()
  readonly bomId: number;

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
