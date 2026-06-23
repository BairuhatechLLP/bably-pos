import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDecimal,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";

export class PaymentDto {
  @ApiProperty({
    description: "Payment method used",
    enum: ["credit", "cash", "card", "upi", "wallet"],
  })
  @IsString()
  @IsIn(["Credit", "Cash", "Bank"])
  readonly paymentMethod: string;

  @ApiProperty({
    description: "Payment amount",
    example: "568.00",
  })
  @IsString()
  @IsDecimal({ decimal_digits: '2' })
  readonly amount: string;

  @ApiProperty({
    description: "Customer name for the payment",
    example: "Anas",
  })
  @IsString()
  @IsOptional()
  readonly customerName: string;
}

export class OrderPaymentDto {
  @ApiProperty({
    description: "Total order amount",
    example: "1018.00",
  })
  @IsString()
  @IsDecimal({ decimal_digits: '2' })
  readonly total: string;

  @ApiProperty({
    description: "Unique order identifier",
    example: 58000,
  })
  @IsInt()
  @IsPositive()
  readonly orderId: number;

  @ApiProperty({
    description: "Unique order identifier",
    example: 157,
  })
  @IsInt()
  @IsPositive()
  readonly companyId: number;

  @ApiProperty({
    description: "Unique staff identifier",
    example: 1,
  })
  @IsInt()
  @IsPositive()
  readonly staffId: number;

  @ApiProperty({
    description: "Counter identifier",
    example: 5,
  })
  @IsInt()
  @IsPositive()
  readonly counterId: number;

  @ApiProperty({
    description: "Shift identifier",
    example: 5,
  })
  @IsInt()
  @IsPositive()
  readonly shiftId: number;

  @ApiProperty({
    description: "Currency code",
    example: "INR",
    enum: ["INR", "USD", "EUR", "GBP"],
  })
  @IsString()
  @IsOptional()
  @IsIn(["INR", "USD", "EUR", "GBP", "AED"])
  readonly currency: string;

  @ApiProperty({
    type: [PaymentDto],
    description: "List of payments made for this order",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  readonly payments: PaymentDto[];

  @ApiProperty({
    description: "Remaining credit balance",
    example: "450.00",
  })
  @IsString()
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  readonly creditBalance: string;
}


