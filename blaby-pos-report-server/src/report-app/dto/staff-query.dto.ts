import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum StaffPerformanceFilter {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  CUSTOM = 'custom',
}

export class StaffListQueryDto {
  @ApiPropertyOptional({
    description: 'Company ID to get staff list (e.g., 158, 159, 160)',
    example: 158,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  companyId: number;
}

export class StaffPerformanceQueryDto {
  @ApiPropertyOptional({
    description: 'Company ID (e.g., 158, 159, 160)',
    example: 158,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  companyId: number;

  @ApiPropertyOptional({
    description: 'Staff ID (adminId from order_master)',
    example: 5,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  staffId: number;

  @ApiPropertyOptional({
    description: 'Filter type: day (today), week (last 7 days), month (current month), custom',
    example: 'day',
    enum: StaffPerformanceFilter,
    required: true,
  })
  @IsEnum(StaffPerformanceFilter)
  filter: StaffPerformanceFilter;

  @ApiPropertyOptional({
    description: 'Start date for custom filter (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for custom filter (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination (starts at 1)',
    example: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of products per page (default: 50, max: 100)',
    example: 50,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Limit total number of products returned (default: all, max: 500)',
    example: 100,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit?: number;
}
