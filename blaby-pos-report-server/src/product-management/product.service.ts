import {
  Injectable,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { SequelizeMultiDbConfig } from '../config/sequelize-multi-db.config';
import { ProductMaster } from '../entities/product-master.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  MultiBranchCreateProductDto,
  MultiBranchUpdateProductDto,
  MultiBranchDeleteByNameDto,
  MultiBranchDeleteBulkDto,
  MultiBranchOutcome,
} from './dto/multi-branch.dto';
import { QueryTypes } from 'sequelize';

// Type for category query results
interface CategoryQueryResult {
  id: number;
  category: string;
  companyid: number;
  isDeleted: number;
}

// Type for product with joined category
interface ProductWithCategoryResult {
  id: number;
  idescription: string;
  barcode: string;
  sp_price: number;
  costprice: number;
  rate: number;
  price: number;
  c_price: number;
  stock: number;
  product_category: number;
  pimage: string;
  active: number;
  adminid: number;
  userid: number;
  companyid: number;
  itemtype: string;
  icode: string;
  is_deleted: number;
  createdat: Date;
  updatedat: Date;
  category_id: number | null;
  category_name: string | null;
  category_alias_name: string | null;
  category_is_show_in_report: number | null;
}

@Injectable()
export class ProductService implements OnModuleInit {
  async onModuleInit() {
    await SequelizeMultiDbConfig.initializeConnections();
  }

  /**
   * Get connection for a specific branch by company ID (primaryBranchId)
   */
  private async getBranchConnection(companyId: number) {
    let connections = SequelizeMultiDbConfig.getConnections();

    if (connections.length === 0) {
      connections = await SequelizeMultiDbConfig.initializeConnections();
    }

    const numericCompanyId = Number(companyId);
    const connection = connections.find(
      (conn) => conn.primaryBranchId === numericCompanyId,
    );

    if (!connection) {
      throw new BadRequestException(
        `Branch with company ID ${numericCompanyId} not found or not configured. Available: ${connections.map((c) => c.primaryBranchId).join(', ')}`,
      );
    }

    return connection;
  }

  /**
   * Create a new product in a specific branch
   */
  async createProduct(
    branchId: number | undefined,
    adminid: number | undefined,
    createDto: CreateProductDto,
  ) {
    if (!branchId) {
      throw new BadRequestException(
        'branchId (company ID) is required for creating products',
      );
    }

    if (!adminid) {
      throw new BadRequestException(
        'adminid is required for creating products',
      );
    }

    const connection = await this.getBranchConnection(branchId);
    const ProductModel = connection.sequelize.model(
      ProductMaster.name,
    ) as typeof ProductMaster;
    const CategoryModel = connection.sequelize.model(
      ProductCategory.name,
    ) as typeof ProductCategory;

    // Handle backward compatibility - if categoryId is provided, use it
    const categoryId = createDto.categoryId || createDto.product_category;

    // Ensure at least one category field is provided
    if (!categoryId) {
      throw new BadRequestException(
        'Either categoryId or product_category must be provided',
      );
    }

    const categoryCheck = await connection.sequelize.query<CategoryQueryResult>(
      `SELECT id, category, companyid, isDeleted
       FROM product_category
       WHERE id = :categoryId
       LIMIT 1`,
      {
        replacements: { categoryId: Number(categoryId) },
        type: QueryTypes.SELECT,
      },
    );

    const anyCategoryWithId =
      categoryCheck.length > 0 ? categoryCheck[0] : null;

    const categoryRows = await connection.sequelize.query<CategoryQueryResult>(
      `SELECT id, category, companyid, isDeleted
       FROM product_category
       WHERE id = :categoryId AND companyid = :companyid AND isDeleted = 0
       LIMIT 1`,
      {
        replacements: {
          categoryId: Number(categoryId),
          companyid: Number(branchId),
        },
        type: QueryTypes.SELECT,
      },
    );

    const category = categoryRows.length > 0 ? categoryRows[0] : null;

    if (!category) {
      const branchCategories = await connection.sequelize.query<CategoryQueryResult>(
        `SELECT id, category, companyid, isDeleted
         FROM product_category
         WHERE companyid = :companyid AND isDeleted = 0
         ORDER BY ID DESC`,
        {
          replacements: { companyid: Number(branchId) },
          type: QueryTypes.SELECT,
        },
      );

      // If category exists in database but for different branch
      if (anyCategoryWithId) {
        throw new BadRequestException(
          `Category with ID ${categoryId} exists but belongs to a different branch (companyid: ${anyCategoryWithId.companyid}). ` +
            `You are trying to use it in branch ${branchId}. Please create or select a category that belongs to branch ${branchId}.`,
        );
      }

      // If no categories exist for this branch at all
      if (branchCategories.length === 0) {
        throw new BadRequestException(
          `No categories found for branch ${branchId}. Please create a category first using POST /product-management/categories?branchId=${branchId}`,
        );
      }

      // Category doesn't exist at all
      throw new BadRequestException(
        `Category with ID ${categoryId} not found. Available categories for branch ${branchId}: ` +
          branchCategories.map((c) => `${c.id} (${c.category})`).join(', '),
      );
    }

    // Copy sp_price to rate, price, c_price, and costprice
    // Copy idescription to icode if icode is not provided
    // Build product data object explicitly to avoid foreign key constraint issues
    const productData: any = {
      idescription: createDto.idescription,
      icode: createDto.icode || createDto.idescription, // Auto-copy from idescription if not provided
      sp_price: createDto.sp_price,
      product_category: categoryId,
      companyid: Number(branchId), // Set companyid from branchId param
      adminid: Number(adminid), // Set adminid from query param (mandatory)
      active: createDto.active ?? 1,
      stock: createDto.stock || 100000,
      itemtype: createDto.itemtype || 'Stock',
      is_deleted: 0,
      // Automatically copy sp_price to other price fields
      rate: createDto.sp_price,
      price: createDto.sp_price,
      c_price: createDto.sp_price,
      costprice: createDto.sp_price,
    };

    // Only add optional fields if they have valid values
    if (createDto.barcode) productData.barcode = createDto.barcode;
    if (createDto.pimage) productData.pimage = createDto.pimage;
    if (createDto.userid) productData.userid = createDto.userid;

    const transaction = await connection.sequelize.transaction();

    try {
      const product = await ProductModel.create(productData, { transaction });
      await transaction.commit();

      return {
        success: true,
        message: 'Product created successfully',
        data: product.toJSON(),
        branchId: Number(branchId),
        branchName: connection.name,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get all products from a specific branch or all branches
   */
  async getProducts(branchId?: number, adminid?: number) {
    const connections = SequelizeMultiDbConfig.getConnections();

    if (branchId) {
      const connection = await this.getBranchConnection(branchId);
      let sql = `
        SELECT
          pm.*,
          pc.id as category_id,
          pc.category as category_name,
          pc.alias_name as category_alias_name,
          pc.is_show_in_report as category_is_show_in_report
        FROM product_master pm
        LEFT JOIN product_category pc ON pm.product_category = pc.id AND pc.isDeleted = 0
        WHERE pm.companyid = :companyid AND pm.is_deleted = 0
      `;

      const replacements: any = { companyid: Number(branchId) };

      // Add adminid filter if provided
      if (adminid) {
        sql += ` AND pm.adminid = :adminid`;
        replacements.adminid = Number(adminid);
      }

      sql += ` ORDER BY pm.id DESC`;

      const products = await connection.sequelize.query<ProductWithCategoryResult>(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });
      const transformedProducts = products.map((row) => ({
        id: row.id,
        idescription: row.idescription,
        barcode: row.barcode,
        sp_price: row.sp_price,
        costprice: row.costprice,
        rate: row.rate,
        price: row.price,
        c_price: row.c_price,
        stock: row.stock,
        product_category: row.product_category,
        pimage: row.pimage,
        active: row.active,
        adminid: row.adminid,
        userid: row.userid,
        companyid: row.companyid,
        itemtype: row.itemtype,
        icode: row.icode,
        is_deleted: row.is_deleted,
        createdat: row.createdat,
        updatedat: row.updatedat,
        productCategory: row.category_id
          ? {
              id: row.category_id,
              category: row.category_name,
              alias_name: row.category_alias_name,
              is_show_in_report: row.category_is_show_in_report,
            }
          : null,
      }));

      return {
        success: true,
        data: transformedProducts,
        branchId: Number(branchId),
        branchName: connection.name,
      };
    } else {
      const results = await Promise.all(
        connections.map(async (conn) => {
          const sql = `
            SELECT
              pm.*,
              pc.id as category_id,
              pc.category as category_name,
              pc.alias_name as category_alias_name,
              pc.is_show_in_report as category_is_show_in_report
            FROM product_master pm
            LEFT JOIN product_category pc ON pm.product_category = pc.id AND pc.isDeleted = 0
            WHERE pm.companyid = :companyid AND pm.is_deleted = 0
            ORDER BY pm.id DESC
          `;

          const products = await conn.sequelize.query<ProductWithCategoryResult>(sql, {
            replacements: { companyid: conn.primaryBranchId },
            type: QueryTypes.SELECT,
          });
          const transformedProducts = products.map((row) => ({
            id: row.id,
            idescription: row.idescription,
            barcode: row.barcode,
            sp_price: row.sp_price,
            costprice: row.costprice,
            rate: row.rate,
            price: row.price,
            c_price: row.c_price,
            stock: row.stock,
            product_category: row.product_category,
            pimage: row.pimage,
            active: row.active,
            adminid: row.adminid,
            userid: row.userid,
            companyid: row.companyid,
            itemtype: row.itemtype,
            icode: row.icode,
            is_deleted: row.is_deleted,
            createdat: row.createdat,
            updatedat: row.updatedat,
            productCategory: row.category_id
              ? {
                  id: row.category_id,
                  category: row.category_name,
                  alias_name: row.category_alias_name,
                  is_show_in_report: row.category_is_show_in_report,
                }
              : null,
          }));

          return {
            branchId: conn.primaryBranchId,
            branchName: conn.name,
            products: transformedProducts,
          };
        }),
      );

      return {
        success: true,
        data: results,
      };
    }
  }

  /**
   * Get a specific product by ID from a specific branch
   */
  async getProductById(id: number, branchId: number | undefined) {
    if (!branchId) {
      throw new BadRequestException('branchId (company ID) is required');
    }

    const connection = await this.getBranchConnection(branchId);

    // Use raw SQL query for reliable data fetching
    const sql = `
      SELECT
        pm.*,
        pc.id as category_id,
        pc.category as category_name,
        pc.alias_name as category_alias_name,
        pc.is_show_in_report as category_is_show_in_report
      FROM product_master pm
      LEFT JOIN product_category pc ON pm.product_category = pc.id AND pc.isDeleted = 0
      WHERE pm.id = :productId AND pm.companyid = :companyid AND pm.is_deleted = 0
      LIMIT 1
    `;

    const products = await connection.sequelize.query<ProductWithCategoryResult>(sql, {
      replacements: {
        productId: Number(id),
        companyid: Number(branchId),
      },
      type: QueryTypes.SELECT,
    });

    if (products.length === 0) {
      throw new NotFoundException(
        `Product with ID ${id} not found in branch ${branchId}`,
      );
    }

    const row = products[0];

    // Transform the flat result into nested structure
    const product = {
      id: row.id,
      idescription: row.idescription,
      barcode: row.barcode,
      sp_price: row.sp_price,
      costprice: row.costprice,
      rate: row.rate,
      price: row.price,
      c_price: row.c_price,
      stock: row.stock,
      product_category: row.product_category,
      pimage: row.pimage,
      active: row.active,
      adminid: row.adminid,
      userid: row.userid,
      companyid: row.companyid,
      itemtype: row.itemtype,
      icode: row.icode,
      is_deleted: row.is_deleted,
      createdat: row.createdat,
      updatedat: row.updatedat,
      productCategory: row.category_id
        ? {
            id: row.category_id,
            category: row.category_name,
            alias_name: row.category_alias_name,
            is_show_in_report: row.category_is_show_in_report,
          }
        : null,
    };

    return {
      success: true,
      data: product,
      branchId: Number(branchId),
      branchName: connection.name,
    };
  }

  /**
   * Update a product in a specific branch
   */
  async updateProduct(
    id: number,
    branchId: number | undefined,
    adminid: number | undefined,
    updateDto: UpdateProductDto,
  ) {
    if (!branchId) {
      throw new BadRequestException(
        'branchId (company ID) is required for updating products',
      );
    }

    const connection = await this.getBranchConnection(branchId);
    const productCheck = await connection.sequelize.query<{ id: number; companyid: number; is_deleted: number }>(
      `SELECT id, companyid, is_deleted
       FROM product_master
       WHERE id = :productId AND companyid = :companyid AND is_deleted = 0
       LIMIT 1`,
      {
        replacements: {
          productId: Number(id),
          companyid: Number(branchId),
        },
        type: QueryTypes.SELECT,
      },
    );

    if (productCheck.length === 0) {
      throw new NotFoundException(
        `Product with ID ${id} not found in branch ${branchId}`,
      );
    }

    // Handle backward compatibility - get the category ID if provided
    const categoryId = updateDto.categoryId || updateDto.product_category;

    // If updating product_category, verify it exists in this branch and is not deleted
    if (categoryId !== undefined) {
      // Use raw SQL query for reliable category validation
      const categoryRows = await connection.sequelize.query<CategoryQueryResult>(
        `SELECT id, category, companyid, isDeleted
         FROM product_category
         WHERE id = :categoryId AND companyid = :companyid AND isDeleted = 0
         LIMIT 1`,
        {
          replacements: {
            categoryId: Number(categoryId),
            companyid: Number(branchId),
          },
          type: QueryTypes.SELECT,
        },
      );

      if (categoryRows.length === 0) {
        throw new BadRequestException(
          `Category with ID ${categoryId} not found in branch ${branchId} or has been deleted`,
        );
      }
      updateDto.product_category = categoryId;
    }

    // Build the UPDATE query dynamically
    const updateFields: string[] = [];
    const replacements: any = {
      productId: Number(id),
      companyid: Number(branchId),
    };

    // Add fields to update
    if (updateDto.idescription !== undefined) {
      updateFields.push('idescription = :idescription');
      replacements.idescription = updateDto.idescription;
    }
    if (updateDto.barcode !== undefined) {
      updateFields.push('barcode = :barcode');
      replacements.barcode = updateDto.barcode;
    }
    if (updateDto.sp_price !== undefined) {
      updateFields.push('sp_price = :sp_price');
      replacements.sp_price = updateDto.sp_price;
    }
    if (updateDto.costprice !== undefined) {
      updateFields.push('costprice = :costprice');
      replacements.costprice = updateDto.costprice;
    }
    if (updateDto.rate !== undefined) {
      updateFields.push('rate = :rate');
      replacements.rate = updateDto.rate;
    }
    if (updateDto.price !== undefined) {
      updateFields.push('price = :price');
      replacements.price = updateDto.price;
    }
    if (updateDto.c_price !== undefined) {
      updateFields.push('c_price = :c_price');
      replacements.c_price = updateDto.c_price;
    }
    if (updateDto.stock !== undefined) {
      updateFields.push('stock = :stock');
      replacements.stock = updateDto.stock;
    }
    if (updateDto.product_category !== undefined) {
      updateFields.push('product_category = :product_category');
      replacements.product_category = updateDto.product_category;
    }
    if (updateDto.pimage !== undefined) {
      updateFields.push('pimage = :pimage');
      replacements.pimage = updateDto.pimage;
    }
    if (updateDto.active !== undefined) {
      updateFields.push('active = :active');
      replacements.active = updateDto.active;
    }
    if (updateDto.itemtype !== undefined) {
      updateFields.push('itemtype = :itemtype');
      replacements.itemtype = updateDto.itemtype;
    }
    if (updateDto.icode !== undefined) {
      updateFields.push('icode = :icode');
      replacements.icode = updateDto.icode;
    }
    if (updateDto.userid !== undefined) {
      updateFields.push('userid = :userid');
      replacements.userid = updateDto.userid;
    }

    // If adminid is provided in query params, add it to the update
    if (adminid) {
      updateFields.push('adminid = :adminid');
      replacements.adminid = Number(adminid);
    }

    if (updateFields.length === 0) {
      throw new BadRequestException('No fields provided to update');
    }

    // Always update the updatedat timestamp
    updateFields.push('updatedat = NOW()');

    const transaction = await connection.sequelize.transaction();

    try {
      await connection.sequelize.query(
        `UPDATE product_master
         SET ${updateFields.join(', ')}
         WHERE id = :productId AND companyid = :companyid`,
        {
          replacements,
          type: QueryTypes.UPDATE,
          transaction,
        },
      );

      await transaction.commit();
      const sql = `
        SELECT
          pm.*,
          pc.id as category_id,
          pc.category as category_name,
          pc.alias_name as category_alias_name,
          pc.is_show_in_report as category_is_show_in_report
        FROM product_master pm
        LEFT JOIN product_category pc ON pm.product_category = pc.id AND pc.isDeleted = 0
        WHERE pm.id = :productId AND pm.companyid = :companyid
        LIMIT 1
      `;

      const updatedProducts = await connection.sequelize.query<ProductWithCategoryResult>(sql, {
        replacements: {
          productId: Number(id),
          companyid: Number(branchId),
        },
        type: QueryTypes.SELECT,
      });

      if (updatedProducts.length === 0) {
        throw new NotFoundException('Product not found after update');
      }

      const row = updatedProducts[0];

      // Transform the flat result into nested structure
      const product = {
        id: row.id,
        idescription: row.idescription,
        barcode: row.barcode,
        sp_price: row.sp_price,
        costprice: row.costprice,
        rate: row.rate,
        price: row.price,
        c_price: row.c_price,
        stock: row.stock,
        product_category: row.product_category,
        pimage: row.pimage,
        active: row.active,
        adminid: row.adminid,
        userid: row.userid,
        companyid: row.companyid,
        itemtype: row.itemtype,
        icode: row.icode,
        is_deleted: row.is_deleted,
        createdat: row.createdat,
        updatedat: row.updatedat,
        productCategory: row.category_id
          ? {
              id: row.category_id,
              category: row.category_name,
              alias_name: row.category_alias_name,
              is_show_in_report: row.category_is_show_in_report,
            }
          : null,
      };

      return {
        success: true,
        message: 'Product updated successfully',
        data: product,
        branchId: Number(branchId),
        branchName: connection.name,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Soft-delete multiple products in a single branch.
   * Sets is_deleted = 1 for every id that currently belongs to the branch and isn't already deleted.
   */
  async bulkDeleteProducts(ids: number[], branchId: number | undefined) {
    if (!branchId) {
      throw new BadRequestException(
        'branchId (company ID) is required for bulk deleting products',
      );
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('ids must be a non-empty array');
    }

    const numericIds = Array.from(
      new Set(
        ids
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value > 0),
      ),
    );

    if (numericIds.length === 0) {
      throw new BadRequestException('ids must contain valid positive integers');
    }

    const connection = await this.getBranchConnection(branchId);

    const existing = await connection.sequelize.query<{ id: number }>(
      `SELECT id FROM product_master
       WHERE id IN (:ids) AND companyid = :companyid AND is_deleted = 0`,
      {
        replacements: { ids: numericIds, companyid: Number(branchId) },
        type: QueryTypes.SELECT,
      },
    );

    const deletableIds = existing.map((row) => Number(row.id));

    if (deletableIds.length === 0) {
      throw new NotFoundException(
        `No active products found for the given ids in branch ${branchId}`,
      );
    }

    const transaction = await connection.sequelize.transaction();
    try {
      await connection.sequelize.query(
        `UPDATE product_master
         SET is_deleted = 1, updatedat = NOW()
         WHERE id IN (:ids) AND companyid = :companyid AND is_deleted = 0`,
        {
          replacements: {
            ids: deletableIds,
            companyid: Number(branchId),
          },
          type: QueryTypes.UPDATE,
          transaction,
        },
      );

      await transaction.commit();

      const skippedIds = numericIds.filter((id) => !deletableIds.includes(id));

      return {
        success: true,
        message: `${deletableIds.length} product(s) deleted successfully`,
        branchId: Number(branchId),
        branchName: connection.name,
        deleted_count: deletableIds.length,
        deleted_ids: deletableIds,
        skipped_ids: skippedIds,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete a product from a specific branch (soft delete)
   */
  async deleteProduct(id: number, branchId: number | undefined) {
    if (!branchId) {
      throw new BadRequestException(
        'branchId (company ID) is required for deleting products',
      );
    }

    const connection = await this.getBranchConnection(branchId);

    // First, verify the product exists using raw SQL
    const productCheck = await connection.sequelize.query<{ id: number; companyid: number; is_deleted: number }>(
      `SELECT id, companyid, is_deleted
       FROM product_master
       WHERE id = :productId AND companyid = :companyid AND is_deleted = 0
       LIMIT 1`,
      {
        replacements: {
          productId: Number(id),
          companyid: Number(branchId),
        },
        type: QueryTypes.SELECT,
      },
    );

    if (productCheck.length === 0) {
      throw new NotFoundException(
        `Product with ID ${id} not found in branch ${branchId}`,
      );
    }

    // Soft delete: set is_deleted to 1 instead of hard delete
    const transaction = await connection.sequelize.transaction();
    try {
      await connection.sequelize.query(
        `UPDATE product_master
         SET is_deleted = 1, updatedat = NOW()
         WHERE id = :productId AND companyid = :companyid`,
        {
          replacements: {
            productId: Number(id),
            companyid: Number(branchId),
          },
          type: QueryTypes.UPDATE,
          transaction,
        },
      );

      await transaction.commit();

      return {
        success: true,
        message: 'Product deleted successfully',
        branchId: Number(branchId),
        branchName: connection.name,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Create the same product in every configured branch.
   * - Each branch gets its own auto-incremented id (no schema collision).
   * - Category is matched by name within each branch's product_category table.
   * - Each branch runs in its own transaction; a failure on one branch does
   *   NOT roll back the others.
   * - Returns one MultiBranchOutcome per branch.
   */
  async multiBranchCreate(
    adminid: number | undefined,
    dto: MultiBranchCreateProductDto,
  ): Promise<{
    success: boolean;
    message: string;
    branches: MultiBranchOutcome[];
  }> {
    if (!adminid) {
      throw new BadRequestException(
        'adminid is required for multi-branch product create',
      );
    }
    if (!dto.idescription?.trim() || !dto.categoryName?.trim()) {
      throw new BadRequestException(
        'idescription and categoryName are required',
      );
    }

    let connections = SequelizeMultiDbConfig.getConnections();
    if (connections.length === 0) {
      connections = await SequelizeMultiDbConfig.initializeConnections();
    }

    const outcomes = await Promise.all(
      connections.map(async (conn) => this.tryCreateInBranch(conn, adminid, dto)),
    );

    const successCount = outcomes.filter((o) => o.success).length;
    return {
      success: successCount > 0,
      message: `Created in ${successCount} of ${outcomes.length} branches`,
      branches: outcomes,
    };
  }

  private async tryCreateInBranch(
    conn: any,
    adminid: number,
    dto: MultiBranchCreateProductDto,
  ): Promise<MultiBranchOutcome> {
    const branchId = conn.primaryBranchId;
    try {
      // ── 0. Duplicate-by-name check on product_master ─────────────────
      // Look for ANY row with this idescription in this branch (regardless
      // of is_deleted). Match case-insensitive + trimmed.
      const existingProduct = (await conn.sequelize.query(
        `SELECT id, is_deleted
         FROM product_master
         WHERE companyid = :companyid
           AND LOWER(TRIM(idescription)) = LOWER(TRIM(:name))
         ORDER BY id DESC LIMIT 1`,
        {
          replacements: {
            companyid: branchId,
            name: dto.idescription,
          },
          type: QueryTypes.SELECT,
        },
      )) as Array<{ id: number; is_deleted: number }>;

      if (existingProduct.length > 0) {
        const row = existingProduct[0];
        // is_deleted = 1 → reactivate (flip the flag, leave other fields)
        if (Number(row.is_deleted) === 1) {
          const t = await conn.sequelize.transaction();
          try {
            await conn.sequelize.query(
              `UPDATE product_master
                 SET is_deleted = 0, updatedat = NOW()
               WHERE id = :productId AND companyid = :companyid`,
              {
                replacements: {
                  productId: Number(row.id),
                  companyid: branchId,
                },
                type: QueryTypes.UPDATE,
                transaction: t,
              },
            );
            await t.commit();
            return {
              branchId,
              branchName: conn.name,
              success: true,
              message: `Reactivated existing product "${dto.idescription}" (was deleted)`,
              data: { id: Number(row.id), action: 'reactivated' },
            };
          } catch (e: any) {
            await t.rollback();
            return {
              branchId,
              branchName: conn.name,
              success: false,
              message: e?.message || 'Reactivation failed',
            };
          }
        }
        // is_deleted != 1 → already exists active, skip
        return {
          branchId,
          branchName: conn.name,
          success: false,
          message: `Product "${dto.idescription}" already exists in this branch`,
        };
      }

      // ── 1. Resolve category id by NAME in this branch ────────────────
      const categoryRows = (await conn.sequelize.query(
        `SELECT id, category
         FROM product_category
         WHERE companyid = :companyid AND isDeleted = 0
           AND LOWER(TRIM(category)) = LOWER(TRIM(:name))
         LIMIT 1`,
        {
          replacements: {
            companyid: branchId,
            name: dto.categoryName,
          },
          type: QueryTypes.SELECT,
        },
      )) as Array<{ id: number; category: string }>;

      if (!categoryRows || categoryRows.length === 0) {
        return {
          branchId,
          branchName: conn.name,
          success: false,
          message: `No category named "${dto.categoryName}" in this branch`,
        };
      }

      const categoryId = Number((categoryRows[0] as any).id);

      const transaction = await conn.sequelize.transaction();
      try {
        const [insertResult]: any = await conn.sequelize.query(
          `INSERT INTO product_master
             (idescription, icode, sp_price, rate, price, c_price, costprice,
              product_category, companyid, adminid, active, stock, itemtype,
              is_deleted, barcode, pimage, userid, createdat, updatedat)
           VALUES
             (:idescription, :icode, :sp_price, :sp_price, :sp_price,
              :sp_price, :sp_price,
              :categoryId, :companyid, :adminid, :active, :stock, :itemtype,
              0, :barcode, :pimage, :userid, NOW(), NOW())`,
          {
            replacements: {
              idescription: dto.idescription.trim(),
              icode: dto.icode || dto.idescription.trim(),
              sp_price: Number(dto.sp_price) || 0,
              categoryId,
              companyid: branchId,
              adminid: Number(adminid),
              active: dto.active ?? 1,
              stock: dto.stock ?? 100000,
              itemtype: dto.itemtype || 'Stock',
              barcode: dto.barcode || null,
              pimage: dto.pimage || null,
              userid: dto.userid || null,
            },
            type: QueryTypes.INSERT,
            transaction,
          },
        );
        await transaction.commit();
        return {
          branchId,
          branchName: conn.name,
          success: true,
          message: 'Created',
          data: { id: Number(insertResult), categoryId },
        };
      } catch (txnError: any) {
        await transaction.rollback();
        return {
          branchId,
          branchName: conn.name,
          success: false,
          message: txnError?.message || 'Insert failed',
        };
      }
    } catch (err: any) {
      return {
        branchId,
        branchName: conn.name,
        success: false,
        message: err?.message || 'Unexpected error',
      };
    }
  }

  /**
   * Update a product across every branch where a row with the given
   * idescription exists. Branches without a matching product are skipped.
   * Each branch's update is its own transaction.
   */
  async multiBranchUpdate(
    dto: MultiBranchUpdateProductDto,
  ): Promise<{
    success: boolean;
    message: string;
    branches: MultiBranchOutcome[];
  }> {
    if (!dto.matchByName?.trim()) {
      throw new BadRequestException(
        'matchByName is required for multi-branch update',
      );
    }

    let connections = SequelizeMultiDbConfig.getConnections();
    if (connections.length === 0) {
      connections = await SequelizeMultiDbConfig.initializeConnections();
    }

    const outcomes = await Promise.all(
      connections.map(async (conn) => this.tryUpdateInBranch(conn, dto)),
    );

    const successCount = outcomes.filter((o) => o.success).length;
    return {
      success: successCount > 0,
      message: `Updated in ${successCount} of ${outcomes.length} branches`,
      branches: outcomes,
    };
  }

  /**
   * Soft-delete a product across every branch — matched by idescription.
   * Branches without a matching product are skipped + reported.
   * Each branch's UPDATE is its own transaction.
   */
  async multiBranchDelete(
    dto: MultiBranchDeleteByNameDto,
  ): Promise<{
    success: boolean;
    message: string;
    branches: MultiBranchOutcome[];
  }> {
    if (!dto.matchByName?.trim()) {
      throw new BadRequestException('matchByName is required');
    }

    let connections = SequelizeMultiDbConfig.getConnections();
    if (connections.length === 0) {
      connections = await SequelizeMultiDbConfig.initializeConnections();
    }

    const outcomes = await Promise.all(
      connections.map(async (conn) =>
        this.tryDeleteProductInBranch(conn, dto.matchByName),
      ),
    );

    const successCount = outcomes.filter((o) => o.success).length;
    return {
      success: successCount > 0,
      message: `Deleted in ${successCount} of ${outcomes.length} branches`,
      branches: outcomes,
    };
  }

  /**
   * BULK multi-branch delete: many product names, one HTTP call.
   * Each branch runs ONE SELECT (count matches) + ONE UPDATE (soft-delete
   * matched ids) — no per-name loop. 5 branches in parallel.
   * For 50 names × 5 branches: ~10 DB queries total, not 500.
   */
  async multiBranchDeleteBulk(
    dto: MultiBranchDeleteBulkDto,
  ): Promise<{
    success: boolean;
    message: string;
    branches: MultiBranchOutcome[];
  }> {
    const cleaned = (dto.names || [])
      .map((n) => (n || '').trim())
      .filter((n) => n.length > 0);
    if (cleaned.length === 0) {
      throw new BadRequestException('names array is empty');
    }

    let connections = SequelizeMultiDbConfig.getConnections();
    if (connections.length === 0) {
      connections = await SequelizeMultiDbConfig.initializeConnections();
    }

    const branchResults = await Promise.all(
      connections.map(async (conn) => {
        const branchId = conn.primaryBranchId;
        try {
          // 1. Find which of the requested names actually exist + are active
          const matches = (await conn.sequelize.query(
            `SELECT idescription FROM product_master
             WHERE companyid = :companyid
               AND is_deleted = 0
               AND LOWER(TRIM(idescription)) IN (:names)`,
            {
              replacements: { companyid: branchId, names: cleaned },
              type: QueryTypes.SELECT,
            },
          )) as Array<{ idescription: string }>;

          const deletable = matches.length;

          if (deletable > 0) {
            // 2. Soft-delete them all in one UPDATE
            await conn.sequelize.query(
              `UPDATE product_master
               SET is_deleted = 1, updatedat = NOW()
               WHERE companyid = :companyid
                 AND is_deleted = 0
                 AND LOWER(TRIM(idescription)) IN (:names)`,
              {
                replacements: { companyid: branchId, names: cleaned },
                type: QueryTypes.UPDATE,
              },
            );
          }

          const skipped = cleaned.length - deletable;
          const parts: string[] = [];
          if (deletable > 0) parts.push(`${deletable} deleted`);
          if (skipped > 0) parts.push(`${skipped} not found`);
          return {
            branchId,
            branchName: conn.name,
            success: deletable > 0,
            message: parts.join(', ') || 'No action',
          } as MultiBranchOutcome;
        } catch (err: any) {
          return {
            branchId,
            branchName: conn.name,
            success: false,
            message:
              err?.parent?.sqlMessage ||
              err?.original?.sqlMessage ||
              err?.message ||
              'Bulk delete failed',
          } as MultiBranchOutcome;
        }
      }),
    );

    const totalDeleted = branchResults.filter((b) => b.success).length;
    return {
      success: totalDeleted > 0,
      message: `${cleaned.length} product name(s) processed across ${branchResults.length} branch(es)`,
      branches: branchResults,
    };
  }

  private async tryDeleteProductInBranch(
    conn: any,
    name: string,
  ): Promise<MultiBranchOutcome> {
    const branchId = conn.primaryBranchId;
    try {
      const existing = (await conn.sequelize.query(
        `SELECT id FROM product_master
         WHERE companyid = :companyid AND is_deleted = 0
           AND LOWER(TRIM(idescription)) = LOWER(TRIM(:name))
         LIMIT 1`,
        {
          replacements: { companyid: branchId, name },
          type: QueryTypes.SELECT,
        },
      )) as Array<{ id: number }>;

      if (!existing || existing.length === 0) {
        return {
          branchId,
          branchName: conn.name,
          success: false,
          message: `No product named "${name}" in this branch`,
        };
      }

      const productId = Number((existing[0] as any).id);
      const transaction = await conn.sequelize.transaction();
      try {
        await conn.sequelize.query(
          `UPDATE product_master
             SET is_deleted = 1, updatedat = NOW()
           WHERE id = :productId AND companyid = :companyid`,
          {
            replacements: { productId, companyid: branchId },
            type: QueryTypes.UPDATE,
            transaction,
          },
        );
        await transaction.commit();
        return {
          branchId,
          branchName: conn.name,
          success: true,
          message: 'Deleted',
          data: { id: productId },
        };
      } catch (txnError: any) {
        await transaction.rollback();
        return {
          branchId,
          branchName: conn.name,
          success: false,
          message: txnError?.message || 'Delete failed',
        };
      }
    } catch (err: any) {
      return {
        branchId,
        branchName: conn.name,
        success: false,
        message: err?.message || 'Unexpected error',
      };
    }
  }

  private async tryUpdateInBranch(
    conn: any,
    dto: MultiBranchUpdateProductDto,
  ): Promise<MultiBranchOutcome> {
    const branchId = conn.primaryBranchId;
    try {
      const existing = (await conn.sequelize.query(
        `SELECT id FROM product_master
         WHERE companyid = :companyid AND is_deleted = 0
           AND LOWER(TRIM(idescription)) = LOWER(TRIM(:matchByName))
         LIMIT 1`,
        {
          replacements: { companyid: branchId, matchByName: dto.matchByName },
          type: QueryTypes.SELECT,
        },
      )) as Array<{ id: number }>;

      if (!existing || existing.length === 0) {
        return {
          branchId,
          branchName: conn.name,
          success: false,
          message: `No product named "${dto.matchByName}" in this branch`,
        };
      }

      const productId = Number((existing[0] as any).id);

      // If a category change is requested, resolve the new category id in
      // THIS branch by name. A failure here aborts THIS branch only.
      let newCategoryId: number | null = null;
      if (dto.categoryName?.trim()) {
        const catRows = (await conn.sequelize.query(
          `SELECT id FROM product_category
           WHERE companyid = :companyid AND isDeleted = 0
             AND LOWER(TRIM(category)) = LOWER(TRIM(:name))
           LIMIT 1`,
          {
            replacements: { companyid: branchId, name: dto.categoryName },
            type: QueryTypes.SELECT,
          },
        )) as Array<{ id: number }>;
        if (!catRows || catRows.length === 0) {
          return {
            branchId,
            branchName: conn.name,
            success: false,
            message: `No category named "${dto.categoryName}" in this branch`,
          };
        }
        newCategoryId = Number((catRows[0] as any).id);
      }

      const fields: string[] = [];
      const replacements: any = {
        productId,
        companyid: branchId,
      };
      if (dto.idescription !== undefined) {
        fields.push('idescription = :idescription');
        replacements.idescription = dto.idescription;
      }
      if (dto.sp_price !== undefined) {
        // Mirror the single-branch behaviour: propagate to rate/price/c_price/costprice
        fields.push(
          'sp_price = :sp_price',
          'rate = :sp_price',
          'price = :sp_price',
          'c_price = :sp_price',
          'costprice = :sp_price',
        );
        replacements.sp_price = Number(dto.sp_price) || 0;
      }
      if (newCategoryId !== null) {
        fields.push('product_category = :product_category');
        replacements.product_category = newCategoryId;
      }
      if (dto.barcode !== undefined) {
        fields.push('barcode = :barcode');
        replacements.barcode = dto.barcode;
      }
      if (dto.stock !== undefined) {
        fields.push('stock = :stock');
        replacements.stock = dto.stock;
      }
      if (dto.itemtype !== undefined) {
        fields.push('itemtype = :itemtype');
        replacements.itemtype = dto.itemtype;
      }
      if (dto.active !== undefined) {
        fields.push('active = :active');
        replacements.active = dto.active;
      }

      if (fields.length === 0) {
        return {
          branchId,
          branchName: conn.name,
          success: false,
          message: 'No fields to update',
        };
      }
      fields.push('updatedat = NOW()');

      const transaction = await conn.sequelize.transaction();
      try {
        await conn.sequelize.query(
          `UPDATE product_master
             SET ${fields.join(', ')}
           WHERE id = :productId AND companyid = :companyid`,
          {
            replacements,
            type: QueryTypes.UPDATE,
            transaction,
          },
        );
        await transaction.commit();
        return {
          branchId,
          branchName: conn.name,
          success: true,
          message: 'Updated',
          data: { id: productId },
        };
      } catch (txnError: any) {
        await transaction.rollback();
        return {
          branchId,
          branchName: conn.name,
          success: false,
          message: txnError?.message || 'Update failed',
        };
      }
    } catch (err: any) {
      return {
        branchId,
        branchName: conn.name,
        success: false,
        message: err?.message || 'Unexpected error',
      };
    }
  }
}
