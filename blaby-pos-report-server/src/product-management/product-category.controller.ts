import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductManagementQueryDto } from './dto/query.dto';
import {
  MultiBranchCreateCategoryDto,
  MultiBranchUpdateCategoryDto,
  MultiBranchDeleteByNameDto,
  MultiBranchDeleteBulkDto,
} from './dto/multi-branch.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('product-management/categories')
export class ProductCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}

  // ────────────────────────────────────────────────────────────────────
  // Static paths FIRST. Must come before any `:id` route so NestJS
  // doesn't try to parse "multi-branch" / "kitchen-displays" as an id.
  // ────────────────────────────────────────────────────────────────────

  /**
   * Get kitchen displays for a specific branch
   * GET /product-management/categories/kitchen-displays?branchId=1
   */
  @Get('kitchen-displays')
  async getKitchenDisplays(
    @Query(ValidationPipe) query: ProductManagementQueryDto,
  ) {
    return this.categoryService.getKitchenDisplays(query.branchId);
  }

  /**
   * Bulk soft-delete categories within ONE branch (single-branch bulk).
   * POST /product-management/categories/bulk-delete?branchId=1
   * Body: { "ids": [1, 2, 3] }
   */
  @UseGuards(JwtAuthGuard)
  @Post('bulk-delete')
  async bulkDeleteCategories(
    @Query(ValidationPipe) query: ProductManagementQueryDto,
    @Body(ValidationPipe) body: BulkDeleteDto,
  ) {
    return this.categoryService.bulkDeleteCategories(body.ids, query.branchId);
  }

  /**
   * Create a category in EVERY branch.
   * POST /product-management/categories/multi-branch
   */
  @UseGuards(JwtAuthGuard)
  @Post('multi-branch')
  async multiBranchCreate(
    @Body(ValidationPipe) body: MultiBranchCreateCategoryDto,
  ) {
    return this.categoryService.multiBranchCreate(body);
  }

  /**
   * Update a category in EVERY branch where it exists (matched by name).
   * PUT /product-management/categories/multi-branch
   */
  @UseGuards(JwtAuthGuard)
  @Put('multi-branch')
  async multiBranchUpdate(
    @Body(ValidationPipe) body: MultiBranchUpdateCategoryDto,
  ) {
    return this.categoryService.multiBranchUpdate(body);
  }

  /**
   * Soft-delete a category in EVERY branch where it exists (matched by name).
   * POST /product-management/categories/multi-branch-delete
   * Body: { "matchByName": "Beverages" }
   */
  @UseGuards(JwtAuthGuard)
  @Post('multi-branch-delete')
  async multiBranchDelete(
    @Body(ValidationPipe) body: MultiBranchDeleteByNameDto,
  ) {
    return this.categoryService.multiBranchDelete(body);
  }

  /** Bulk multi-branch delete categories — one round-trip, many names. */
  @UseGuards(JwtAuthGuard)
  @Post('multi-branch-delete-bulk')
  async multiBranchDeleteBulk(
    @Body(ValidationPipe) body: MultiBranchDeleteBulkDto,
  ) {
    return this.categoryService.multiBranchDeleteBulk(body);
  }

  // ────────────────────────────────────────────────────────────────────
  // Base + dynamic routes
  // ────────────────────────────────────────────────────────────────────

  /**
   * Create a new product category
   * POST /product-management/categories?branchId=1
   */
  @Post()
  async createCategory(
    @Query(ValidationPipe) query: ProductManagementQueryDto,
    @Body(ValidationPipe) createDto: CreateCategoryDto,
  ) {
    return this.categoryService.createCategory(query.branchId, createDto);
  }

  /**
   * Get all categories from a specific branch or all branches
   */
  @Get()
  async getCategories(@Query(ValidationPipe) query: ProductManagementQueryDto) {
    return this.categoryService.getCategories(query.branchId);
  }

  /**
   * Get a specific category by ID
   */
  @Get(':id')
  async getCategoryById(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) query: ProductManagementQueryDto,
  ) {
    return this.categoryService.getCategoryById(id, query.branchId);
  }

  /**
   * Update a category
   */
  @Put(':id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) query: ProductManagementQueryDto,
    @Body(ValidationPipe) updateDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, query.branchId, updateDto);
  }

  /**
   * Delete a category
   */
  @Delete(':id')
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) query: ProductManagementQueryDto,
  ) {
    return this.categoryService.deleteCategory(id, query.branchId);
  }
}
