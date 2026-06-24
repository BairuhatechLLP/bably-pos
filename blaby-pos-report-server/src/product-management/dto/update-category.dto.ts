import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Category name must not exceed 255 characters' })
  category?: string;

  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Display ID must be a positive number' })
  display_id?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Alias name must not exceed 255 characters' })
  alias_name?: string;

  @IsBoolean()
  @IsOptional()
  is_show_in_report?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'User ID must be a positive number' })
  userid?: number;
}
