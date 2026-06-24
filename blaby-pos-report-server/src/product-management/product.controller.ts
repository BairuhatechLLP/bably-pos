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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductManagementQueryDto } from './dto/query.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import {
  MultiBranchCreateProductDto,
  MultiBranchUpdateProductDto,
  MultiBranchDeleteByNameDto,
  MultiBranchDeleteBulkDto,
  MultiBranchAdminQueryDto,
} from './dto/multi-branch.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('product-management/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ────────────────────────────────────────────────────────────────────
  // Static paths FIRST. NestJS matches in declaration order, so anything
  // with a path segment like `/multi-branch` must come before `:id` —
  // otherwise the :id route catches the word "multi-branch" and throws
  // "Numeric string expected" from ParseIntPipe.
  // ────────────────────────────────────────────────────────────────────

  /**
   * Bulk soft-delete products in a branch
   * POST /product-management/products/bulk-delete?branchId=1
   * Body: { "ids": [1, 2, 3] }
   */
  @UseGuards(JwtAuthGuard)
  @Post('bulk-delete')
  async bulkDeleteProducts(
    @Query(ValidationPipe) query: ProductManagementQueryDto,
    @Body(ValidationPipe) body: BulkDeleteDto,
  ) {
    return this.productService.bulkDeleteProducts(body.ids, query.branchId);
  }

  /**
   * Create a product in EVERY branch.
   * POST /product-management/products/multi-branch?adminid=X
   * Body: MultiBranchCreateProductDto (categoryName matched per branch)
   */
  @UseGuards(JwtAuthGuard)
  @Post('multi-branch')
  async multiBranchCreate(
    @Query(ValidationPipe) query: MultiBranchAdminQueryDto,
    @Body(ValidationPipe) body: MultiBranchCreateProductDto,
  ) {
    return this.productService.multiBranchCreate(query.adminid, body);
  }

  /**
   * Update a product in EVERY branch where it exists (matched by name).
   * PUT /product-management/products/multi-branch
   */
  @UseGuards(JwtAuthGuard)
  @Put('multi-branch')
  async multiBranchUpdate(
    @Body(ValidationPipe) body: MultiBranchUpdateProductDto,
  ) {
    return this.productService.multiBranchUpdate(body);
  }

  /**
   * Soft-delete a product in EVERY branch where it exists (matched by name).
   * POST /product-management/products/multi-branch-delete
   * Body: { "matchByName": "Mango Shake" }
   */
  @UseGuards(JwtAuthGuard)
  @Post('multi-branch-delete')
  async multiBranchDelete(
    @Body(ValidationPipe) body: MultiBranchDeleteByNameDto,
  ) {
    return this.productService.multiBranchDelete(body);
  }

  /**
   * Bulk multi-branch delete — many product names in one round-trip.
   * POST /product-management/products/multi-branch-delete-bulk
   * Body: { "names": ["Mango Shake", "Falooda"] }
   */
  @UseGuards(JwtAuthGuard)
  @Post('multi-branch-delete-bulk')
  async multiBranchDeleteBulk(
    @Body(ValidationPipe) body: MultiBranchDeleteBulkDto,
  ) {
    return this.productService.multiBranchDeleteBulk(body);
  }

  // ────────────────────────────────────────────────────────────────────
  // Base + dynamic routes
  // ────────────────────────────────────────────────────────────────────

  /**
   * Create a new product
   * POST /product-management/products?branchId=1&adminid=1
   */
  @Post()
  async createProduct(
    @Query(ValidationPipe) query: ProductManagementQueryDto,
    @Body(ValidationPipe) createDto: CreateProductDto,
  ) {
    return this.productService.createProduct(
      query.branchId,
      query.adminid,
      createDto,
    );
  }

  /**
   * Get all products from a specific branch or all branches
   * GET /product-management/products?branchId=1&adminid=1 (specific branch and admin)
   * GET /product-management/products?branchId=1 (specific branch)
   * GET /product-management/products (all branches)
   */
  @Get()
  async getProducts(@Query(ValidationPipe) query: ProductManagementQueryDto) {
    return this.productService.getProducts(query.branchId, query.adminid);
  }

  /**
   * Get a specific product by ID
   * GET /product-management/products/:id?branchId=1
   */
  @Get(':id')
  async getProductById(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) query: ProductManagementQueryDto,
  ) {
    return this.productService.getProductById(id, query.branchId);
  }

  /**
   * Update a product
   * PUT /product-management/products/:id?branchId=1&adminid=1
   */
  @Put(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) query: ProductManagementQueryDto,
    @Body(ValidationPipe) updateDto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(
      id,
      query.branchId,
      query.adminid,
      updateDto,
    );
  }

  /**
   * Delete a product
   * DELETE /product-management/products/:id?branchId=1
   */
  @Delete(':id')
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @Query(ValidationPipe) query: ProductManagementQueryDto,
  ) {
    return this.productService.deleteProduct(id, query.branchId);
  }
}
