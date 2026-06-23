import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsNumber } from "class-validator";

export class ReportQueryDto {
  @ApiPropertyOptional({
    description: "Start date for filtering data (YYYY-MM-DD)",
    example: "2024-03-01",
  })
  @IsOptional()
  from_date?: string;

  @ApiPropertyOptional({
    description: "End date for filtering data (YYYY-MM-DD)",
    example: "2024-03-20",
  })
  @IsOptional()
  to_date?: string;

  @ApiPropertyOptional({
    description: "Branch ID to filter data for specific branch",
    example: 1,
  })
  @IsOptional()
  branchId?: number;

  @ApiPropertyOptional({ description: "Search term" })
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({
    description: "Specific date for filtering data (YYYY-MM-DD)",
    example: "2024-03-15",
  })
  @IsOptional()
  specific_date?: string;
}
