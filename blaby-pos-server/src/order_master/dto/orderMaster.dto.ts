import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsNumberString, IsOptional, Min } from "class-validator";
import { Order } from "../../shared/constants/constants";

export class getOrderQueryDto {
  @ApiProperty()
  @IsNumberString()
  companyId: number;

  @ApiPropertyOptional()
  @IsOptional()
  idShort: string;

  @ApiPropertyOptional()
  @IsOptional()
  displayId: number;

  @ApiProperty()
  @IsIn(["customer", "chef", "master"], { message: "invalid Display Type" })
  displayType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(["all","pending", "cancelled", "started", "finished", "served", "billed"], {
    message: "invalid status",
  })
  status?: string;

  @ApiProperty()
  @IsNumberString()
  @IsOptional()
  utcOffset: number;

  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;
}
export class OrderPageOptionsDto {
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
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly take?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
