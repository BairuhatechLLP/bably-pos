import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ReportQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering data (YYYY-MM-DD)',
    example: '2024-03-01',
  })
  @IsOptional()
  @IsString()
  from_date?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering data (YYYY-MM-DD)',
    example: '2024-03-20',
  })
  @IsOptional()
  @IsString()
  to_date?: string;

  @ApiPropertyOptional({
    description: 'Branch ID to filter data for specific branch',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;

  @ApiPropertyOptional({
    description: 'Search term for filtering',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'Specific date for filtering (YYYY-MM-DD)',
    example: '2024-03-15',
  })
  @IsOptional()
  @IsString()
  specific_date?: string;

  @ApiPropertyOptional({
    description: 'Group products by category',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  groupByCategory?: boolean;
}
