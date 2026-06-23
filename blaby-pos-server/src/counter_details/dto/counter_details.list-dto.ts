import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
export class ListCounterDetailsDto {
  @ApiProperty()
  @IsOptional()
  readonly sDate: string;
  @ApiProperty()
  @IsOptional()
  readonly lDate: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly query: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly status: string;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly page: number;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly take: number;
  @ApiProperty()
  @IsNumber()
  readonly adminId: number;
  @ApiProperty()
  @IsNumber()
  readonly counter_id: number;
}