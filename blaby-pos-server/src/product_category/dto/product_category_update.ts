import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryType } from './product_category_create';

export class UpdateProductCategoryDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly category: string;
  
  @IsOptional()
  @ApiProperty()
  @IsEnum(CategoryType)
  readonly categoryType: CategoryType;

  @IsOptional()
  @ApiProperty()
  readonly isDeleted: boolean;
}
