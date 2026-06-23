import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";

export class getBomListQueryDto {
  @ApiProperty()
  @IsNumberString()
  companyId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchProduct: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ids: string;
}
