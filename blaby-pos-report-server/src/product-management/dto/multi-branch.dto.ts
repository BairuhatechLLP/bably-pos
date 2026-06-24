import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Fan-out a new product into every configured branch.
 * The server matches the categoryName against each branch's product_category
 * table; branches without a matching category are skipped and reported.
 */
export class MultiBranchCreateProductDto {
  @IsString()
  @IsNotEmpty()
  idescription: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sp_price: number;

  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @IsString()
  @IsOptional()
  icode?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  stock?: number;

  @IsString()
  @IsOptional()
  pimage?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  active?: number;

  @IsString()
  @IsOptional()
  itemtype?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  userid?: number;
}

/**
 * Fan-out an update across every branch where the product is found
 * (matched by idescription). Branches without a matching product are skipped.
 */
export class MultiBranchUpdateProductDto {
  /** Current name of the product, used to find it in each branch. */
  @IsString()
  @IsNotEmpty()
  matchByName: string;

  // New values (any may be provided)
  @IsString()
  @IsOptional()
  idescription?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  sp_price?: number;

  @IsString()
  @IsOptional()
  categoryName?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  stock?: number;

  @IsString()
  @IsOptional()
  itemtype?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  active?: number;
}

/**
 * Fan-out a new category into every branch.
 * The kitchen display is matched by name per-branch (each branch has its own
 * kitchen_display rows). Branches missing a matching display are skipped.
 */
export class MultiBranchCreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  kitchenDisplayName: string;

  @IsString()
  @IsOptional()
  alias_name?: string;

  @IsBoolean()
  @IsOptional()
  is_show_in_report?: boolean;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  userid?: number;
}

export class MultiBranchUpdateCategoryDto {
  /** Current name of the category, used to find it in each branch. */
  @IsString()
  @IsNotEmpty()
  matchByName: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  kitchenDisplayName?: string;

  @IsString()
  @IsOptional()
  alias_name?: string;

  @IsBoolean()
  @IsOptional()
  is_show_in_report?: boolean;
}

/**
 * Delete (soft) a product or category across every branch — matched by name.
 * Same shape works for both.
 */
export class MultiBranchDeleteByNameDto {
  @IsString()
  @IsNotEmpty()
  matchByName: string;
}

/**
 * Bulk multi-branch delete: many names at once, one round-trip.
 * Server fans out per branch in parallel and loops names within each branch.
 */
export class MultiBranchDeleteBulkDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  names: string[];
}

/**
 * Adminid query DTO — required for multi-branch product create only (matches
 * the single-branch behaviour where adminid is in the query string).
 */
export class MultiBranchAdminQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  adminid?: number;
}

/**
 * Per-branch result of a multi-branch operation. The combined response always
 * returns one of these per branch so the client can show the user exactly
 * what landed where.
 */
export interface MultiBranchOutcome {
  branchId: number;
  branchName: string;
  success: boolean;
  message: string;
  data?: any;
}
