import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { SequelizeMultiDbConfig } from '../config/sequelize-multi-db.config';
import { CreateOrderDto, UpdateOrderDto, OrderItemDto } from './dto/order.dto';

export interface OrderRow {
  id: number;
  companyId: number;
  adminId: number;
  staffId: number;
  tokenNo: string;
  total: number;
  cooking_instructions: string | null;
  paymentMethod: string | null;
  orderStatus: string;
  ac_room: boolean | number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemRow {
  id: number;
  orderId: number;
  productId: number;
  idescription: string | null;
  sp_price: number;
  quantity: number;
  comb_id: string | null;
  parcel_option: string | null;
  ice_option: string | null;
  sugar_option: string | null;
}

@Injectable()
export class OrderService implements OnModuleInit {
  async onModuleInit() {
    await SequelizeMultiDbConfig.initializeConnections();
  }

  private async getBranchConnection(companyId: number) {
    let connections = SequelizeMultiDbConfig.getConnections();
    if (connections.length === 0) {
      connections = await SequelizeMultiDbConfig.initializeConnections();
    }
    const numericCompanyId = Number(companyId);
    const conn = connections.find(
      (c) => c.primaryBranchId === numericCompanyId,
    );
    if (!conn) {
      throw new BadRequestException(
        `Branch with company ID ${numericCompanyId} not found.`,
      );
    }
    return conn;
  }

  /**
   * Resolve BOTH adminId and staffId for a new order in this branch.
   *
   * order_master has two NOT NULL FK columns:
   *   - adminId  → user table  (the branch admin / KDS-logged-in user)
   *   - staffId  → contact_master table  (a staff member)
   *
   * The kitchen display filters orders by `adminId = <KDS user's id>`, so we
   * MUST use the branch admin id, not just any user id, otherwise orders
   * don't show up on the KDS at nfpmna.bairuhatech.com (or wherever).
   *
   * Strategy:
   *   adminId: pulled from `company_master.adminid` for the target branch —
   *            authoritative, same value the KDS user logs in with.
   *   staffId: copied from the most recent order's staffId (guaranteed to
   *            satisfy whatever FK exists). Fallback: any contact_master row
   *            for the company. Last resort: client hint.
   */
  private async resolveBranchUserIds(
    conn: any,
    companyId: number,
    clientHintAdminId?: number,
    clientHintStaffId?: number,
  ): Promise<{ adminId: number; staffId: number }> {
    let adminId = 0;
    let staffId = 0;

    // --- adminId: authoritative source is company_master.adminid ---
    try {
      const fromCompany = (await conn.sequelize.query(
        `SELECT adminid FROM company_master
         WHERE id = :companyId AND adminid IS NOT NULL
         LIMIT 1`,
        {
          replacements: { companyId },
          type: QueryTypes.SELECT,
        },
      )) as Array<{ adminid: number }>;
      if (fromCompany.length && fromCompany[0].adminid) {
        adminId = Number(fromCompany[0].adminid);
      }
    } catch {
      // company_master may have a different schema; ignore
    }

    // --- staffId: prefer the staffId on a recent order in this branch
    //     (guaranteed to satisfy contact_master FK)
    const fromOrders = (await conn.sequelize.query(
      `SELECT adminId, staffId FROM order_master
       WHERE companyId = :companyId
         AND adminId IS NOT NULL
         AND staffId IS NOT NULL
       ORDER BY id DESC LIMIT 1`,
      {
        replacements: { companyId },
        type: QueryTypes.SELECT,
      },
    )) as Array<{ adminId: number; staffId: number }>;
    if (fromOrders.length && fromOrders[0].staffId) {
      staffId = Number(fromOrders[0].staffId);
    }
    // If we still couldn't resolve adminId from company_master, fall back to
    // the recent order's adminId (legacy behaviour).
    if (!adminId && fromOrders.length && fromOrders[0].adminId) {
      adminId = Number(fromOrders[0].adminId);
    }

    // --- Fallback layers ---
    if (!adminId && clientHintAdminId && Number(clientHintAdminId) > 0) {
      adminId = Number(clientHintAdminId);
    }
    if (!staffId && clientHintStaffId && Number(clientHintStaffId) > 0) {
      staffId = Number(clientHintStaffId);
    }
    if (!adminId) {
      try {
        const fromUsers = (await conn.sequelize.query(
          `SELECT id FROM user WHERE companyid = :companyId
           ORDER BY id ASC LIMIT 1`,
          {
            replacements: { companyId },
            type: QueryTypes.SELECT,
          },
        )) as Array<{ id: number }>;
        if (fromUsers.length && fromUsers[0].id) {
          adminId = Number(fromUsers[0].id);
        }
      } catch {
        // ignore
      }
    }
    if (!staffId) {
      try {
        const fromContacts = (await conn.sequelize.query(
          `SELECT id FROM contact_master WHERE companyid = :companyId
           ORDER BY id ASC LIMIT 1`,
          {
            replacements: { companyId },
            type: QueryTypes.SELECT,
          },
        )) as Array<{ id: number }>;
        if (fromContacts.length && fromContacts[0].id) {
          staffId = Number(fromContacts[0].id);
        }
      } catch {
        // ignore
      }
    }

    if (!adminId || !staffId) {
      throw new BadRequestException(
        `Could not determine adminId/staffId for branch ${companyId}. ` +
          `Check that company_master has an adminid for this branch, ` +
          `or place at least one order from POS first.`,
      );
    }
    return { adminId, staffId };
  }

  /**
   * Generate the next tokenNo for this branch, matching the bairuha-pos algorithm.
   * COUNT(today's orders for this adminId+companyId) + 1 — same race-prone logic
   * as POS; deliberately kept identical so tokens stay continuous between the two.
   */
  private async nextTokenNo(
    conn: any,
    adminId: number,
    companyId: number,
  ): Promise<string> {
    // Use UTC consistently — POS stores createdAt at UTC clock values, so
    // we compare against DATE(UTC_TIMESTAMP()) instead of CURDATE() (which
    // would use this connection's session_tz of +05:30).
    const result = (await conn.sequelize.query(
      `SELECT COUNT(*) as c
       FROM order_master
       WHERE adminId = :adminId
         AND companyId = :companyId
         AND DATE(createdAt) = DATE(UTC_TIMESTAMP())`,
      {
        replacements: { adminId, companyId },
        type: QueryTypes.SELECT,
      },
    )) as Array<{ c: number }>;
    const count = Number(result[0]?.c || 0);
    return String(count + 1);
  }

  async createOrder(branchId: number | undefined, body: CreateOrderDto) {
    if (!branchId) {
      throw new BadRequestException('branchId is required');
    }

    const conn = await this.getBranchConnection(branchId);
    const companyId = Number(branchId);

    // Resolve both adminId and staffId from the most recent order in this
    // branch — guarantees they satisfy FK constraints (POS just used them).
    const { adminId, staffId } = await this.resolveBranchUserIds(
      conn,
      companyId,
      body.adminId,
      body.staffId,
    );

    const t = await conn.sequelize.transaction();
    try {
      const tokenNo = await this.nextTokenNo(conn, adminId, companyId);
      const orderId = Math.round(Date.now() / 10);
      const acRoom = body.ac_room ? 1 : 0;

      const [insertResult]: any = await conn.sequelize.query(
        // UTC_TIMESTAMP() instead of NOW() so createdAt matches the clock
        // POS uses (POS goes via fruits-server which has no Sequelize
        // timezone config and stores UTC). Keeps both services consistent
        // and makes today/yesterday boundaries align with the KDS.
        `INSERT INTO order_master
           (adminId, companyId, staffId, orderId, tokenNo, ac_room,
            shift_id, cooking_instructions, orderStatus, billing_status,
            total, paymentMethod, createdAt, updatedAt)
         VALUES
           (:adminId, :companyId, :staffId, :orderId, :tokenNo, :ac_room,
            NULL, :notes, 'pending', 0,
            :total, :paymentMethod, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
        {
          replacements: {
            adminId,
            companyId,
            staffId,
            orderId,
            tokenNo,
            ac_room: acRoom,
            notes: (body.cooking_instructions ?? '').trim() || null,
            // total is BIGINT in production — round to integer
            total: Math.round(Number(body.total) || 0),
            paymentMethod: body.paymentMethod || null,
          },
          type: QueryTypes.INSERT,
          transaction: t,
        },
      );

      const newOrderId = Number(insertResult);
      await this.insertItems(conn, newOrderId, companyId, body.orderItems, t);

      await t.commit();

      return {
        success: true,
        message: 'Order placed successfully',
        branchId: companyId,
        branchName: conn.name,
        data: {
          id: newOrderId,
          tokenNo,
          orderId,
          total: Math.round(Number(body.total) || 0),
          paymentMethod: body.paymentMethod || null,
          cooking_instructions: (body.cooking_instructions ?? '').trim(),
        },
      };
    } catch (err: any) {
      await t.rollback();
      // Surface the actual SQL error so the app can show a real message
      // instead of a generic 500.
      const detail =
        err?.parent?.sqlMessage ||
        err?.original?.sqlMessage ||
        err?.message ||
        'Order create failed';
      throw new InternalServerErrorException(`Order create failed: ${detail}`);
    }
  }

  async updateOrder(
    id: number,
    branchId: number | undefined,
    body: UpdateOrderDto,
  ) {
    if (!branchId) {
      throw new BadRequestException('branchId is required');
    }

    const conn = await this.getBranchConnection(branchId);
    const companyId = Number(branchId);
    const orderId = Number(id);

    const existing = await conn.sequelize.query<{ id: number }>(
      `SELECT id FROM order_master
       WHERE id = :id AND companyId = :companyId
       LIMIT 1`,
      {
        replacements: { id: orderId, companyId },
        type: QueryTypes.SELECT,
      },
    );

    if (!existing || existing.length === 0) {
      throw new NotFoundException(
        `Order ${id} not found in branch ${branchId}`,
      );
    }

    const t = await conn.sequelize.transaction();
    try {
      await conn.sequelize.query(
        `UPDATE order_master
         SET total = :total,
             paymentMethod = :paymentMethod,
             ac_room = :ac_room,
             cooking_instructions = :notes,
             orderStatus = 'pending',
             updatedAt = UTC_TIMESTAMP()
         WHERE id = :id AND companyId = :companyId`,
        {
          replacements: {
            id: orderId,
            companyId,
            // total is BIGINT — round to integer
            total: Math.round(Number(body.total) || 0),
            paymentMethod: body.paymentMethod || null,
            ac_room: body.ac_room ? 1 : 0,
            notes: (body.cooking_instructions ?? '').trim() || null,
          },
          type: QueryTypes.UPDATE,
          transaction: t,
        },
      );

      await conn.sequelize.query(
        `DELETE FROM order_items WHERE orderId = :orderId`,
        {
          replacements: { orderId },
          type: QueryTypes.DELETE,
          transaction: t,
        },
      );

      await this.insertItems(conn, orderId, companyId, body.orderItems, t);
      await t.commit();

      return {
        success: true,
        message: 'Order updated successfully',
        branchId: companyId,
        branchName: conn.name,
        data: { id: orderId },
      };
    } catch (err: any) {
      await t.rollback();
      const detail =
        err?.parent?.sqlMessage ||
        err?.original?.sqlMessage ||
        err?.message ||
        'Order update failed';
      throw new InternalServerErrorException(`Order update failed: ${detail}`);
    }
  }

  private async insertItems(
    conn: any,
    orderId: number,
    companyId: number,
    items: OrderItemDto[],
    transaction: any,
  ) {
    for (const item of items) {
      await conn.sequelize.query(
        // Same UTC alignment as order_master — match POS clock semantics
        `INSERT INTO order_items
           (orderId, productId, idescription, sp_price, quantity, comb_id,
            companyId, orderStatus, parcel_option, ice_option, sugar_option,
            createdAt, updatedAt)
         VALUES
           (:orderId, :productId, :idescription, :sp_price, :quantity, :comb_id,
            :companyId, 'pending', :parcel, :ice, :sugar,
            UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
        {
          replacements: {
            orderId,
            productId: Number(item.productId),
            idescription: item.idescription || null,
            // sp_price column is BIGINT in production — round to integer
            sp_price: Math.round(Number(item.sp_price) || 0),
            quantity: Math.round(Number(item.quantity) || 1),
            comb_id: item.comb_id || null,
            companyId,
            parcel: item.parcel_option || 'dine-in',
            ice: item.ice_option || 'normal',
            sugar: item.sugar_option || 'normal',
          },
          type: QueryTypes.INSERT,
          transaction,
        },
      );
    }
  }

  async listRecentOrders(branchId: number | undefined, days: number) {
    if (!branchId) {
      throw new BadRequestException('branchId is required');
    }
    const conn = await this.getBranchConnection(branchId);
    const companyId = Number(branchId);
    const safeDays = Math.max(1, Math.min(Number(days) || 3, 30));

    const orders = await conn.sequelize.query<OrderRow>(
      // Sort by id (auto-increment) instead of createdAt — historical orders
      // written before our UTC fix have IST clock timestamps that bubble to
      // the top and bury newly-created UTC-stamped orders. Insertion order
      // (id) reflects real chronology regardless of stored datetime.
      `SELECT id, companyId, adminId, staffId, tokenNo, total,
              cooking_instructions, paymentMethod, orderStatus,
              ac_room, createdAt, updatedAt
       FROM order_master
       WHERE companyId = :companyId
         AND createdAt >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
       ORDER BY id DESC
       LIMIT 200`,
      {
        replacements: { companyId, days: safeDays },
        type: QueryTypes.SELECT,
      },
    );

    if (orders.length === 0) {
      return {
        success: true,
        data: [],
        branchId: companyId,
        branchName: conn.name,
      };
    }

    const orderIds = orders.map((o) => o.id);
    const items = await conn.sequelize.query<OrderItemRow>(
      `SELECT id, orderId, productId, idescription, sp_price, quantity,
              comb_id, parcel_option, ice_option, sugar_option
       FROM order_items
       WHERE orderId IN (:orderIds)`,
      {
        replacements: { orderIds },
        type: QueryTypes.SELECT,
      },
    );

    const itemsByOrder = new Map<number, OrderItemRow[]>();
    items.forEach((it) => {
      const arr = itemsByOrder.get(it.orderId) || [];
      arr.push(it);
      itemsByOrder.set(it.orderId, arr);
    });

    return {
      success: true,
      data: orders.map((o) => ({
        ...o,
        orderItems: itemsByOrder.get(o.id) || [],
      })),
      branchId: companyId,
      branchName: conn.name,
    };
  }

  /**
   * Diagnostic — return the adminId/staffId my service would use for a new
   * order in this branch, plus the list of kitchen displays in this branch
   * and the count of categories per display. Lets us verify that the values
   * we'd write match what the KDS reads.
   */
  async diagnose(branchId: number | undefined) {
    if (!branchId) {
      throw new BadRequestException('branchId is required');
    }
    const conn = await this.getBranchConnection(branchId);
    const companyId = Number(branchId);

    let resolved: any = null;
    let resolveError: string | null = null;
    try {
      resolved = await this.resolveBranchUserIds(conn, companyId);
    } catch (e: any) {
      resolveError = e?.message || 'resolve failed';
    }

    const companyRow = (await conn.sequelize.query(
      `SELECT id, adminid, bname FROM company_master WHERE id = :id LIMIT 1`,
      {
        replacements: { id: companyId },
        type: QueryTypes.SELECT,
      },
    )) as Array<{ id: number; adminid: number; bname: string }>;

    const recentOrders = (await conn.sequelize.query(
      `SELECT id, adminId, staffId, tokenNo, orderStatus, createdAt
       FROM order_master
       WHERE companyId = :companyId
       ORDER BY id DESC LIMIT 5`,
      {
        replacements: { companyId },
        type: QueryTypes.SELECT,
      },
    )) as Array<any>;

    // MySQL-side time, to confirm what timezone the DB is in
    const dbTime = (await conn.sequelize.query(
      `SELECT NOW() AS now_local, UTC_TIMESTAMP() AS utc_now,
              CURDATE() AS today_local, @@session.time_zone AS session_tz`,
      { type: QueryTypes.SELECT },
    )) as Array<any>;

    // For each of the 3 most-recent orders, show what display each item maps to
    const recentIds = recentOrders.slice(0, 3).map((o) => o.id);
    let itemBreakdown: any[] = [];
    if (recentIds.length) {
      itemBreakdown = (await conn.sequelize.query(
        `SELECT oi.id AS itemId, oi.orderId, oi.productId, oi.idescription,
                pm.id AS pm_id, pm.product_category, pm.is_deleted,
                pc.id AS pc_id, pc.category AS pc_name, pc.display_id,
                pc.isDeleted AS pc_deleted,
                kd.name AS kd_name
         FROM order_items oi
         LEFT JOIN product_master pm ON oi.productId = pm.id
         LEFT JOIN product_category pc ON pm.product_category = pc.id
         LEFT JOIN kitchen_display kd ON pc.display_id = kd.id
         WHERE oi.orderId IN (:orderIds)
         ORDER BY oi.orderId DESC, oi.id ASC`,
        {
          replacements: { orderIds: recentIds },
          type: QueryTypes.SELECT,
        },
      )) as Array<any>;
    }

    // Simulate the KDS query for displayId=1 today — what orders would it
    // see? Use UTC date semantics (matches POS storage clock).
    let kdsSimulation: any[] = [];
    try {
      kdsSimulation = (await conn.sequelize.query(
        `SELECT DISTINCT om.id, om.tokenNo, om.adminId, om.orderStatus,
                om.createdAt
         FROM order_master om
         INNER JOIN order_items oi ON oi.orderId = om.id
         INNER JOIN product_master pm ON oi.productId = pm.id
         INNER JOIN product_category pc ON pm.product_category = pc.id
         WHERE om.companyId = :companyId
           AND om.adminId = :adminId
           AND om.orderStatus IN ('pending', 'started')
           AND DATE(om.createdAt) = DATE(UTC_TIMESTAMP())
           AND pc.display_id = 1
         ORDER BY om.id DESC LIMIT 10`,
        {
          replacements: { companyId, adminId: resolved?.adminId || 0 },
          type: QueryTypes.SELECT,
        },
      )) as Array<any>;
    } catch (e: any) {
      kdsSimulation = [{ error: e?.message }];
    }

    const displays = (await conn.sequelize.query(
      `SELECT kd.id, kd.name,
              (SELECT COUNT(*) FROM product_category pc
                WHERE pc.display_id = kd.id AND pc.isDeleted = 0
                  AND pc.companyid = :companyId) AS categoryCount
       FROM kitchen_display kd
       WHERE kd.company_id = :companyId
       ORDER BY kd.id ASC`,
      {
        replacements: { companyId },
        type: QueryTypes.SELECT,
      },
    )) as Array<{ id: number; name: string; categoryCount: number }>;

    return {
      success: true,
      branchId: companyId,
      branchName: conn.name,
      resolved,
      resolveError,
      companyMaster: companyRow[0] || null,
      recentOrders,
      kitchenDisplays: displays,
      dbTime: dbTime[0] || null,
      itemBreakdown,
      kdsSimulation,
      nextTokenWouldBe: resolved?.adminId
        ? await this.nextTokenNo(conn, resolved.adminId, companyId)
        : null,
    };
  }

  /**
   * Cancel an order — sets orderStatus='cancelled' on the order and all its
   * items. Refuses if the order is already billed or cancelled.
   */
  async cancelOrder(id: number, branchId: number | undefined) {
    if (!branchId) {
      throw new BadRequestException('branchId is required');
    }
    const conn = await this.getBranchConnection(branchId);
    const companyId = Number(branchId);
    const orderId = Number(id);

    const existing = (await conn.sequelize.query(
      `SELECT id, orderStatus FROM order_master
       WHERE id = :id AND companyId = :companyId LIMIT 1`,
      {
        replacements: { id: orderId, companyId },
        type: QueryTypes.SELECT,
      },
    )) as Array<{ id: number; orderStatus: string }>;

    if (!existing || existing.length === 0) {
      throw new NotFoundException(
        `Order ${id} not found in branch ${branchId}`,
      );
    }
    const currentStatus = String(existing[0].orderStatus || '').toLowerCase();
    if (currentStatus === 'billed') {
      throw new BadRequestException(
        'This order is already billed and cannot be cancelled',
      );
    }
    if (currentStatus === 'cancelled') {
      return {
        success: true,
        message: 'Order was already cancelled',
        branchId: companyId,
        branchName: conn.name,
        data: { id: orderId, orderStatus: 'cancelled' },
      };
    }

    const t = await conn.sequelize.transaction();
    try {
      await conn.sequelize.query(
        `UPDATE order_master
         SET orderStatus = 'cancelled', updatedAt = UTC_TIMESTAMP()
         WHERE id = :id AND companyId = :companyId`,
        {
          replacements: { id: orderId, companyId },
          type: QueryTypes.UPDATE,
          transaction: t,
        },
      );
      await conn.sequelize.query(
        `UPDATE order_items
         SET orderStatus = 'cancelled', updatedAt = UTC_TIMESTAMP()
         WHERE orderId = :orderId`,
        {
          replacements: { orderId },
          type: QueryTypes.UPDATE,
          transaction: t,
        },
      );
      await t.commit();
      return {
        success: true,
        message: 'Order cancelled',
        branchId: companyId,
        branchName: conn.name,
        data: { id: orderId, orderStatus: 'cancelled' },
      };
    } catch (err: any) {
      await t.rollback();
      const detail =
        err?.parent?.sqlMessage ||
        err?.original?.sqlMessage ||
        err?.message ||
        'Cancel failed';
      throw new InternalServerErrorException(`Cancel failed: ${detail}`);
    }
  }

  async getOrderById(id: number, branchId: number | undefined) {
    if (!branchId) {
      throw new BadRequestException('branchId is required');
    }
    const conn = await this.getBranchConnection(branchId);
    const companyId = Number(branchId);
    const orderId = Number(id);

    const orders = await conn.sequelize.query<OrderRow>(
      `SELECT id, companyId, adminId, staffId, tokenNo, total,
              cooking_instructions, paymentMethod, orderStatus,
              ac_room, createdAt, updatedAt
       FROM order_master
       WHERE id = :id AND companyId = :companyId
       LIMIT 1`,
      {
        replacements: { id: orderId, companyId },
        type: QueryTypes.SELECT,
      },
    );

    if (!orders || orders.length === 0) {
      throw new NotFoundException(
        `Order ${id} not found in branch ${branchId}`,
      );
    }

    const items = await conn.sequelize.query<OrderItemRow>(
      `SELECT id, orderId, productId, idescription, sp_price, quantity,
              comb_id, parcel_option, ice_option, sugar_option
       FROM order_items
       WHERE orderId = :orderId`,
      {
        replacements: { orderId },
        type: QueryTypes.SELECT,
      },
    );

    return {
      success: true,
      data: { ...orders[0], orderItems: items },
      branchId: companyId,
      branchName: conn.name,
    };
  }
}
