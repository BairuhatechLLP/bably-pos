import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Order } from "../../shared/constants/constants";

export class OrderRetailQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  readonly staffId?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  readonly orderId?: number;

  @ApiPropertyOptional()
  @IsString()
  @Type(() => String)
  @IsOptional()
  readonly from?: string;

  @ApiPropertyOptional()
  @IsString()
  @Type(() => String)
  @IsOptional()
  readonly search?: string;

  @ApiPropertyOptional()
  @IsString()
  @Type(() => String)
  @IsOptional()
  readonly to?: string;

  @ApiPropertyOptional({ default: "all" })
  @IsString()
  @Type(() => String)
  @IsOptional()
  @IsIn(["pending", "cancelled", "started", "finished", "served", "all","billed" , "allWithoutCancel"], {
    message: "Invalid Order Status",
  })
  readonly status?: string = "all";

  @ApiPropertyOptional({ enum: Order, default: Order.DESC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.DESC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly take?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
