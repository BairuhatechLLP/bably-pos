import {
  Injectable,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { SequelizeMultiDbConfig } from '../config/sequelize-multi-db.config';
import { ProductCategory } from '../entities/product-category.entity';
import { KitchenDisplay } from '../entities/kitchen-display.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  MultiBranchCreateCategoryDto,
  MultiBranchUpdateCategoryDto,
  MultiBranchDeleteByNameDto,
  MultiBranchDeleteBulkDto,
  MultiBranchOutcome,
} from './dto/multi-branch.dto';
import { QueryTypes, Transaction } from 'sequelize';

@Injectable()
export class ProductCategoryService implements OnModuleInit {
  async onModuleInit() {
    await SequelizeMultiDbConfig.initializeConnections();
  }

  private async getBranchConnection(companyId: number) {
    let connections = SequelizeMultiDbConfig.getConnections();

    if (connections.length === 0) {
      connections = await SequelizeMultiDbConfig.initializeConnections();
    }

    const numericCompanyId = Number(companyId);
    const connection = connections.find(
      (c) => c.primaryBranchId === numericCompanyId,
    );

    if (!connection) {
      throw new BadRequestException(
        `Branch with company ID ${numericCompanyId} not found. Available: ${connections
          .map((c) => c.primaryBranchId)
          .join(', ')}`,
      );
    }
    return connection;
  }

  async createCategory(
    branchId: number | undefined,
    createDto: CreateCategoryDto,
  ) {
    if (!branchId) {
      throw new BadRequestException(
        'branchId (company ID) is required for creating categories',
      );
    }

    const connection = await this.getBranchConnection(branchId);
    const CategoryModel = connection.sequelize.model(
      ProductCategory.name,
    ) as typeof ProductCategory;

    // Validate that kitchen display exists for this branch
    if (createDto.display_id) {
      const KitchenDisplayModel = connection.sequelize.model(
        KitchenDisplay.name,
      ) as typeof KitchenDisplay;

      const displayExists = await KitchenDisplayModel.findOne({
        where: {
          id: createDto.display_id,
          company_id: Number(branchId),
        },
      });

      if (!displayExists) {
        throw new BadRequestException(
          `Kitchen display with ID ${createDto.display_id} not found for branch ${branchId}`,
        );
      }
    }

    const data: Partial<ProductCategory> = {
      category: createDto.category,
      display_id: createDto.display_id,
      categoryType: 'product',
      userid: createDto.userid ? Number(createDto.userid) : undefined,
      companyid: Number(branchId),
      isDeleted: 0,
      id_short: '',
      alias_name: createDto.alias_name ?? createDto.category,
      is_show_in_report: createDto.is_show_in_report ? 1 : 0,
    } as any;

    const t = await connection.sequelize.transaction();
    try {
      const category = await CategoryModel.create(data, { transaction: t });
      await t.commit();

      const saved = await CategoryModel.findByPk(category.id);
      return {
        success: true,
        message: 'Category created successfully',
        data: category.toJSON(),
        branchId: Number(branchId),
        branchName: connection.name,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getCategories(branchId?: number) {
    let connections = SequelizeMultiDbConfig.getConnections();

    // Ensure connections are initialized
    if (connections.length === 0) {
      connections = await SequelizeMultiDbConfig.initializeConnections();
    }

    if (branchId) {
      const conn = await this.getBranchConnection(branchId);

      const rows = await conn.sequelize.query(
        `SELECT id, category, categoryType, userid, companyid, isDeleted, id_short,
                is_show_in_report, alias_name, display_id, createdat, updatedat
         FROM product_category
         WHERE companyid = :companyid AND isDeleted = 0
         ORDER BY id DESC`,
        { replacements: { companyid: branchId }, type: QueryTypes.SELECT },
      );

      return { success: true, data: rows, branchId, branchName: conn.name };
    }

    const results = await Promise.all(
      connections.map(async (conn) => {
        const rows = await conn.sequelize.query(
          `SELECT id, category, categoryType, userid, companyid, isDeleted, id_short,
                  is_show_in_report, alias_name, display_id, createdat, updatedat
           FROM product_category
           WHERE companyid = :companyid AND isDeleted = 0
           ORDER BY id DESC`,
          {
            replacements: { companyid: conn.primaryBranchId },
            type: QueryTypes.SELECT,
          },
        );
        return {
          branchId: conn.primaryBranchId,
          branchName: conn.name,
          categories: rows,
        };
      }),
    );

    return { success: true, data: results };
  }

  /**
   * Get kitchen displays for a specific branch
   */
  async getKitchenDisplays(branchId: number | undefined) {
    if (!branchId) {
      throw new BadRequestException(
        'branchId (company ID) is required to fetch kitchen displays',
      );
    }

    const conn = await this.getBranchConnection(branchId);
    const KitchenDisplayModel = conn.sequelize.model(
      KitchenDisplay.name,
    ) as typeof KitchenDisplay;

    const displays = await KitchenDisplayModel.findAll({
      where: {
        company_id: Number(branchId),
      },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    return {
      success: true,
      data: displays.map((d) => ({
        id: d.id,
        name: d.name,
      })),
      branchId,
      branchName: conn.name,
    };
  }

  async getCategoryById(id: number, branchId: number | undefined) {
    if (!branchId) throw new BadRequestException('branchId is required');

    const conn = await this.getBranchConnection(branchId);
    const CategoryModel = conn.sequelize.model(
      ProductCategory.name,
    ) as typeof ProductCategory;

    const category = await CategoryModel.findOne({
      where: { id, companyid: Number(branchId), isDeleted: 0 },
    });

    if (!category)
      throw new NotFoundException(
        `Category ${id} not found in branch ${branchId}`,
      );

    return {
      success: true,
      data: category.toJSON(),
      branchId,
      branchName: conn.name,
    };
  }

  async updateCategory(
    id: number,
    branchId: number | undefined,
    updateDto: UpdateCategoryDto,
  ) {
    if (!branchId) {
      throw new BadRequestException(
        'branchId (company ID) is required for updating categories',
      );
    }

    const conn = await this.getBranchConnection(branchId);
    const CategoryModel = conn.sequelize.model(
      ProductCategory.name,
    ) as typeof ProductCategory;

    // Validate kitchen display if being updated
    if (updateDto.display_id !== undefined && updateDto.display_id !== null) {
      const KitchenDisplayModel = conn.sequelize.model(
        KitchenDisplay.name,
      ) as typeof KitchenDisplay;

      const displayExists = await KitchenDisplayModel.findOne({
        where: {
          id: updateDto.display_id,
          company_id: Number(branchId),
        },
      });

      if (!displayExists) {
        throw new BadRequestException(
          `Kitchen display with ID ${updateDto.display_id} not found for branch ${branchId}`,
        );
      }
    }

    const numericId = parseInt(String(id), 10);
    const numericBranchId = parseInt(String(branchId), 10);

    const categories = await conn.sequelize.query(
      `SELECT id, category, categoryType, userid, companyid, isDeleted, id_short,
              is_show_in_report, alias_name, display_id, createdat, updatedat
       FROM product_category
       WHERE id = :id AND companyid = :companyid AND isDeleted = 0
       LIMIT 1`,
      {
        replacements: { id: numericId, companyid: numericBranchId },
        type: QueryTypes.SELECT,
      },
    );

    if (!categories || categories.length === 0) {
      throw new NotFoundException(
        `Category with ID ${id} not found in branch ${branchId}.`,
      );
    }

    const category = await CategoryModel.findOne({
      where: {
        id: numericId,
        companyid: numericBranchId,
      } as any,
    });

    if (!category) {
      // Build update SQL
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updateDto.category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(updateDto.category);
      }
      if (updateDto.display_id !== undefined) {
        updateFields.push('display_id = ?');
        updateValues.push(updateDto.display_id);
      }
      if (updateDto.alias_name !== undefined) {
        updateFields.push('alias_name = ?');
        updateValues.push(updateDto.alias_name);
      }
      if (updateDto.is_show_in_report !== undefined) {
        updateFields.push('is_show_in_report = ?');
        updateValues.push(updateDto.is_show_in_report ? 1 : 0);
      }
      if (updateDto.userid !== undefined) {
        updateFields.push('userid = ?');
        updateValues.push(updateDto.userid || null);
      }

      if (updateFields.length === 0) {
        return {
          success: false,
          message: 'No fields provided to update',
          data: categories[0],
          branchId,
          branchName: conn.name,
        };
      }

      // Execute raw SQL update
      const t = await conn.sequelize.transaction();
      try {
        // Add id and companyid to replacements
        updateValues.push(numericId, numericBranchId);

        await conn.sequelize.query(
          `UPDATE product_category
           SET ${updateFields.join(', ')}, updatedat = NOW()
           WHERE id = ? AND companyid = ?`,
          {
            replacements: updateValues,
            type: QueryTypes.UPDATE,
            transaction: t,
          },
        );
        await t.commit();

        // Get updated category
        const [updated] = await conn.sequelize.query(
          `SELECT * FROM product_category WHERE id = :id AND companyid = :companyid`,
          {
            replacements: { id: numericId, companyid: numericBranchId },
            type: QueryTypes.SELECT,
          },
        );

        return {
          success: true,
          message: 'Category updated successfully (via raw SQL)',
          data: updated,
          branchId,
          branchName: conn.name,
        };
      } catch (error) {
        await t.rollback();
        throw error;
      }
    }

    const payload: Partial<ProductCategory> = {};

    if (updateDto.category !== undefined) payload.category = updateDto.category;
    if (updateDto.display_id !== undefined)
      payload.display_id = updateDto.display_id;
    if (updateDto.alias_name !== undefined)
      payload.alias_name = updateDto.alias_name;
    if (updateDto.is_show_in_report !== undefined)
      payload.is_show_in_report = updateDto.is_show_in_report ? 1 : 0;
    if (updateDto.userid !== undefined)
      payload.userid = updateDto.userid ? Number(updateDto.userid) : undefined;

    if (Object.keys(payload).length === 0) {
      return {
        success: false,
        message: 'No fields provided to update',
        data: category.toJSON(),
        branchId,
        branchName: conn.name,
      };
    }

    const t: Transaction = await conn.sequelize.transaction();
    try {
      await category.update(payload, { transaction: t });
      await t.commit();
      await category.reload();

      return {
        success: true,
        message: 'Category updated successfully',
        data: category.toJSON(),
        branchId,
        branchName: conn.name,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async deleteCategory(id: number, branchId: number | undefined) {
    if (!branchId)
      throw new BadRequestException(
        'branchId is required for deleting categories',
      );

    const conn = await this.getBranchConnection(branchId);

    const numericId = parseInt(String(id), 10);
    const numericBranchId = parseInt(String(branchId), 10);

    // Use raw SQL for both the existence check and the soft-delete write —
    // matches the workaround pattern in updateCategory (Sequelize ORM findOne
    // returns null for some rows in this multi-DB setup, even when raw SQL
    // finds them).
    const existing = await conn.sequelize.query<{ id: number }>(
      `SELECT id FROM product_category
       WHERE id = :id AND companyid = :companyid AND isDeleted = 0
       LIMIT 1`,
      {
        replacements: { id: numericId, companyid: numericBranchId },
        type: QueryTypes.SELECT,
      },
    );

    if (!existing || existing.length === 0) {
      throw new NotFoundException(
        `Category ${id} not found in branch ${branchId}`,
      );
    }

    const t = await conn.sequelize.transaction();
    try {
      await conn.sequelize.query(
        `UPDATE product_category
         SET isDeleted = 1, updatedat = NOW()
         WHERE id = :id AND companyid = :companyid`,
        {
          replacements: { id: numericId, companyid: numericBranchId },
          type: QueryTypes.UPDATE,
          transaction: t,
        },
      );
      await t.commit();
      return {
        success: true,
        message: 'Category deleted successfully',
        branchId,
        branchName: conn.name,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Bulk soft-delete categories within a SINGLE branch. Mirrors the products
   * bulk-delete endpoint. Returns deleted/skipped ids.
   */
  async bulkDeleteCategories(ids: number[], branchId: number | undefined) {
    if (!branchId) {
      throw new BadRequestException(
        'branchId (company ID) is required for bulk deleting categories',
      );
    }
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('ids must be a non-empty array');
    }

    const numericIds = Array.from(
      new Set(
        ids
          .map((v) => Number(v))
          .filter((v) => Number.isInteger(v) && v > 0),
      ),
    );
    if (numericIds.length === 0) {
      throw new BadRequestException('ids must contain valid positive integers');
    }

    const conn = await this.getBranchConnection(branchId);

    const existing = (await conn.sequelize.query(
      `SELECT id FROM product_category
       WHERE id IN (:ids) AND companyid = :companyid AND isDeleted = 0`,
      {
        replacements: { ids: numericIds, companyid: Number(branchId) },
        type: QueryTypes.SELECT,
      },
    )) as Array<{ id: number }>;

    const deletableIds = existing.map((r) => Number(r.id));
    if (deletableIds.length === 0) {
      throw new NotFoundException(
        `No active categories found for the given ids in branch ${branchId}`,
      );
    }

    const t = await conn.sequelize.transaction();
    try {
      await conn.sequelize.query(
        `UPDATE product_category
         SET isDeleted = 1, updatedat = NOW()
         WHERE id IN (:ids) AND companyid = :companyid AND isDeleted = 0`,
        {
          replacements: {
            ids: deletableIds,
            companyid: Number(branchId),
          },
          type: QueryTypes.UPDATE,
          transaction: t,
        },
      );
      await t.commit();

      const skippedIds = numericIds.filter((id) => !deletableIds.includes(id));
      return {
        success: true,
        message: `${deletableIds.length} category(s) deleted successfully`,
        branchId: Number(branchId),
        branchName: conn.name,
        deleted_count: deletableIds.length,
        deleted_ids: deletableIds,
        skipped_ids: skippedIds,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Create the same category in every branch.
   * - Kitchen display matched by name within each branch's kitchen_display
   * - Branches without a matching kitchen display are SKIPPED + reported
   * - Each branch's INSERT is its own transaction
   */
  async multiBranchCreate(
    dto: MultiBranchCreateCategoryDto,
  ): Promise<{
    success: boolean;
    message: string;
    branches: MultiBranchOutcome[];
  }> {
    if (!dto.category?.trim() || !dto.kitchenDisplayName?.trim()) {
      throw new BadRequestException(
        'category and kitchenDisplayName are required',
      );
    }

    let connections = SequelizeMultiDbConfig.getConnections();
    if (connections.length === 0) {
      connections = await SequelizeMultiDbConfig.initializeConnections();
    }

    const outcomes = await Promise.all(
      connections.map(async (conn) => this.tryCreateInBranch(conn, dto)),
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
    dto: MultiBranchCreateCategoryDto,
  ): Promise<MultiBranchOutcome> {
    const branchId = conn.primaryBranchId;
    try {
      // Resolve kitchen_display id by NAME in this branch
      const kdRows = (await conn.sequelize.query(
        `SELECT id, name FROM kitchen_display
         WHERE company_id = :companyid
           AND LOWER(TRIM(name)) = LOWER(TRIM(:name))
         LIMIT 1`,
        {
          replacements: { companyid: branchId, name: dto.kitchenDisplayName },
          type: QueryTypes.SELECT,
        },
      )) as Array<{ id: number; name: string }>;

      if (!kdRows || kdRows.length === 0) {
        return {
          branchId,
          branchName: conn.name,
          success: false,
          message: `No kitchen display named "${dto.kitchenDisplayName}" in this branch`,
        };
      }

      const displayId = Number((kdRows[0] as any).id);

      const t = await conn.sequelize.transaction();
      try {
        const [insertResult]: any = await conn.sequelize.query(
          `INSERT INTO product_category
             (category, categoryType, display_id, alias_name, is_show_in_report,
              userid, companyid, isDeleted, id_short, createdat, updatedat)
           VALUES
             (:category, 'product', :display_id, :alias_name, :is_show_in_report,
              :userid, :companyid, 0, '', NOW(), NOW())`,
          {
            replacements: {
              category: dto.category.trim(),
              display_id: displayId,
              alias_name: (dto.alias_name ?? dto.category).trim(),
              is_show_in_report: dto.is_show_in_report ? 1 : 0,
              userid: dto.userid || null,
              companyid: branchId,
            },
            type: QueryTypes.INSERT,
            transaction: t,
          },
        );
        await t.commit();
        return {
          branchId,
          branchName: conn.name,
          success: true,
          message: 'Created',
          data: { id: Number(insertResult), display_id: displayId },
        };
      } catch (txnError: any) {
        await t.rollback();
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
   * Update a category across every branch that has a matching name.
   * Each branch's UPDATE is its own transaction.
   */
  async multiBranchUpdate(
    dto: MultiBranchUpdateCategoryDto,
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
   * Soft-delete a category across every branch — matched by name.
   * Each branch's UPDATE is its own transaction; non-matching branches
   * are skipped and reported.
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
        this.tryDeleteCategoryInBranch(conn, dto.matchByName),
      ),
    );

    const successCount = outcomes.filter((o) => o.success).length;
    return {
      success: successCount > 0,
      message: `Deleted in ${successCount} of ${outcomes.length} branches`,
      branches: outcomes,
    };
  }

  /** BULK multi-branch delete for categories — see product.service for shape. */
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
          // 1. Count matching active categories
          const matches = (await conn.sequelize.query(
            `SELECT category FROM product_category
             WHERE companyid = :companyid
               AND isDeleted = 0
               AND LOWER(TRIM(category)) IN (:names)`,
            {
              replacements: { companyid: branchId, names: cleaned },
              type: QueryTypes.SELECT,
            },
          )) as Array<{ category: string }>;

          const deletable = matches.length;

          if (deletable > 0) {
            await conn.sequelize.query(
              `UPDATE product_category
               SET isDeleted = 1, updatedat = NOW()
               WHERE companyid = :companyid
                 AND isDeleted = 0
                 AND LOWER(TRIM(category)) IN (:names)`,
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
      message: `${cleaned.length} category name(s) processed across ${branchResults.length} branch(es)`,
      branches: branchResults,
    };
  }

  private async tryDeleteCategoryInBranch(
    conn: any,
    name: string,
  ): Promise<MultiBranchOutcome> {
    const branchId = conn.primaryBranchId;
    try {
      const existing = (await conn.sequelize.query(
        `SELECT id FROM product_category
         WHERE companyid = :companyid AND isDeleted = 0
           AND LOWER(TRIM(category)) = LOWER(TRIM(:name))
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
          message: `No category named "${name}" in this branch`,
        };
      }

      const categoryId = Number((existing[0] as any).id);
      const t = await conn.sequelize.transaction();
      try {
        await conn.sequelize.query(
          `UPDATE product_category
             SET isDeleted = 1, updatedat = NOW()
           WHERE id = :categoryId AND companyid = :companyid`,
          {
            replacements: { categoryId, companyid: branchId },
            type: QueryTypes.UPDATE,
            transaction: t,
          },
        );
        await t.commit();
        return {
          branchId,
          branchName: conn.name,
          success: true,
          message: 'Deleted',
          data: { id: categoryId },
        };
      } catch (txnError: any) {
        await t.rollback();
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
    dto: MultiBranchUpdateCategoryDto,
  ): Promise<MultiBranchOutcome> {
    const branchId = conn.primaryBranchId;
    try {
      const existing = (await conn.sequelize.query(
        `SELECT id FROM product_category
         WHERE companyid = :companyid AND isDeleted = 0
           AND LOWER(TRIM(category)) = LOWER(TRIM(:name))
         LIMIT 1`,
        {
          replacements: { companyid: branchId, name: dto.matchByName },
          type: QueryTypes.SELECT,
        },
      )) as Array<{ id: number }>;

      if (!existing || existing.length === 0) {
        return {
          branchId,
          branchName: conn.name,
          success: false,
          message: `No category named "${dto.matchByName}" in this branch`,
        };
      }

      const categoryId = Number((existing[0] as any).id);

      // Resolve kitchen display if changing
      let newDisplayId: number | null = null;
      if (dto.kitchenDisplayName?.trim()) {
        const kdRows = (await conn.sequelize.query(
          `SELECT id FROM kitchen_display
           WHERE company_id = :companyid
             AND LOWER(TRIM(name)) = LOWER(TRIM(:name))
           LIMIT 1`,
          {
            replacements: { companyid: branchId, name: dto.kitchenDisplayName },
            type: QueryTypes.SELECT,
          },
        )) as Array<{ id: number }>;
        if (!kdRows || kdRows.length === 0) {
          return {
            branchId,
            branchName: conn.name,
            success: false,
            message: `No kitchen display named "${dto.kitchenDisplayName}" in this branch`,
          };
        }
        newDisplayId = Number((kdRows[0] as any).id);
      }

      const fields: string[] = [];
      const replacements: any = { categoryId, companyid: branchId };
      if (dto.category !== undefined) {
        fields.push('category = :category');
        replacements.category = dto.category;
      }
      if (newDisplayId !== null) {
        fields.push('display_id = :display_id');
        replacements.display_id = newDisplayId;
      }
      if (dto.alias_name !== undefined) {
        fields.push('alias_name = :alias_name');
        replacements.alias_name = dto.alias_name;
      }
      if (dto.is_show_in_report !== undefined) {
        fields.push('is_show_in_report = :is_show_in_report');
        replacements.is_show_in_report = dto.is_show_in_report ? 1 : 0;
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

      const t = await conn.sequelize.transaction();
      try {
        await conn.sequelize.query(
          `UPDATE product_category
             SET ${fields.join(', ')}
           WHERE id = :categoryId AND companyid = :companyid`,
          {
            replacements,
            type: QueryTypes.UPDATE,
            transaction: t,
          },
        );
        await t.commit();
        return {
          branchId,
          branchName: conn.name,
          success: true,
          message: 'Updated',
          data: { id: categoryId },
        };
      } catch (txnError: any) {
        await t.rollback();
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
