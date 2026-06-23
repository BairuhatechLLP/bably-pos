import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateKitchenDisplayDto {
  @ApiProperty({ description: "Name of the kitchen display", example: "Main Kitchen Display" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: "Company ID", example: 1 })
  @IsNotEmpty()
  @IsNumber()
  company_id: number;
}

export class UpdateKitchenDisplayDto {
  @ApiProperty({ description: "Kitchen Display ID", example: 1 })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ description: "Name of the kitchen display", example: "Updated Kitchen Display" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ description: "Company ID", example: 1 })
  @IsOptional()
  @IsNumber()
  company_id?: number;
}


export class GetKitchenDisplayQueryDto {
  @ApiProperty({ description: "Company ID", example: 1, required: true })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  companyId: number;

  @ApiProperty({ description: "Search term for filtering by name", example: "Kitchen", required: false })
  @IsOptional()
  @IsString()
  search?: string;
}