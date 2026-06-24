import { Injectable, OnModuleInit } from '@nestjs/common';
import { col, fn, Op, literal, QueryTypes } from 'sequelize';
import moment from 'moment';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { OrderMaster } from '../entities/order-master.entity';
import { OrderItems } from '../entities/order-items.entity';
import { ProductMaster } from '../entities/product-master.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { CompanyMaster } from '../entities/company-master.entity';
import {
  SequelizeMultiDbConfig,
  BranchConnection,
} from '../config/sequelize-multi-db.config';
import { ReportQueryDto } from './dto/query.dto';

// Type definitions for raw SQL query results
interface TodayStatsResult {
  todayorder: number;
  todayamount: number | null;
}

interface Last7DaysResult {
  label: string;
  value: number;
}

interface TopBranchResult {
  companyId: number;
  totalSales: number;
  totalOrders: number;
  cm_id: number;
  cm_bname: string;
}

interface TopProductResult {
  productId: number;
  totalAmount: number;
  totalSold: number;
  pm_idescription: string;
  pm_sp_price: number;
}

@Injectable()
export class ReportAppSequelizeService implements OnModuleInit {
  private branchConnections: BranchConnection[] = [];

  async onModuleInit() {
    this.branchConnections =
      await SequelizeMultiDbConfig.initializeConnections();
  }

  private async formatDate(date: Date | moment.Moment | string) {
    // FIXED: Use moment to parse date string correctly
    // This prevents timezone shift issues when converting string dates
    // Sequelize will handle timezone based on its config (+05:30 IST)
    return moment(date || new Date()).toDate();
  }

  // SECURITY FIX: Helper method to build date conditions safely
  // Prevents SQL injection by using proper parameter binding
  private buildDateCondition(
    filter: string,
    startDate?: string,
    endDate?: string,
  ): {
    condition: string;
    calculatedStartDate: string;
    calculatedEndDate: string;
  } {
    const today = moment().format('YYYY-MM-DD');
    let condition = '';
    let calculatedStartDate = '';
    let calculatedEndDate = '';

    switch (filter) {
      case 'day':
        calculatedStartDate = today;
        calculatedEndDate = today;
        condition = 'AND DATE(om.createdAt) = CURDATE()';
        break;

      case 'week':
        calculatedStartDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
        calculatedEndDate = today;
        // FIXED: Added upper boundary to prevent future records
        condition =
          'AND om.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND om.createdAt < CURDATE() + INTERVAL 1 DAY';
        break;

      case 'month':
        calculatedStartDate = moment().startOf('month').format('YYYY-MM-DD');
        calculatedEndDate = moment().endOf('month').format('YYYY-MM-DD');
        // FIXED: Using template strings safely with validated date format
        condition = `AND om.createdAt >= '${calculatedStartDate} 00:00:00' AND om.createdAt <= '${calculatedEndDate} 23:59:59'`;
        break;

      case 'custom':
        if (!startDate || !endDate) {
          throw new Error(
            'Start date and end date are required for custom filter',
          );
        }
        // Validate date format to prevent SQL injection
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
          throw new Error('Invalid date format. Expected YYYY-MM-DD');
        }
        calculatedStartDate = startDate;
        calculatedEndDate = endDate;
        // Safe to use after validation
        condition = `AND om.createdAt >= '${startDate} 00:00:00' AND om.createdAt <= '${endDate} 23:59:59'`;
        break;

      default:
        throw new Error('Invalid filter type');
    }

    return { condition, calculatedStartDate, calculatedEndDate };
  }

  // DATABASE BRANCHES - Get all available database branches (for filtering)
  async getDatabaseBranches(): Promise<CommonResponseDto> {
    try {
      const branches = this.branchConnections.map((conn) => ({
        id: conn.id,
        name: conn.name,
        primaryBranchId: conn.primaryBranchId,
      }));

      return new CommonResponseDto(
        branches,
        true,
        'Database branches fetched successfully',
      );
    } catch (err) {
      return new CommonResponseDto(
        [],
        false,
        'Failed to fetch database branches',
      );
    }
  }

  // DIAGNOSTIC - Check data in each database
  async diagnosticCheck(): Promise<CommonResponseDto> {
    try {
      const diagnostics = await this.queryAllBranches(async (conn) => {
        const { sequelize } = conn;

        // Check total orders
        const totalOrders = await sequelize.query(
          `
          SELECT COUNT(*) as total FROM order_master
        `,
          { type: QueryTypes.SELECT },
        );

        // Check today's orders
        const todayOrders = await sequelize.query(
          `
          SELECT COUNT(*) as total FROM order_master
          WHERE DATE(createdAt) = CURDATE()
        `,
          { type: QueryTypes.SELECT },
        );

        // Check distinct companyIds
        const companyIds = await sequelize.query(
          `
          SELECT DISTINCT companyId FROM order_master
          LIMIT 10
        `,
          { type: QueryTypes.SELECT },
        );

        // Check latest order
        const latestOrder = await sequelize.query(
          `
          SELECT id, companyId, DATE(createdAt) as orderDate, total, orderStatus
          FROM order_master
          ORDER BY createdAt DESC
          LIMIT 1
        `,
          { type: QueryTypes.SELECT },
        );

        // Check company_master
        const companies = await sequelize.query(
          `
          SELECT id, bname FROM company_master
          LIMIT 10
        `,
          { type: QueryTypes.SELECT },
        );

        return {
          databaseId: conn.id,
          databaseName: conn.name,
          primaryBranchId: conn.primaryBranchId,
          totalOrders: totalOrders[0],
          todayOrders: todayOrders[0],
          companyIds: companyIds,
          latestOrder: latestOrder[0] || null,
          companies: companies,
        };
      });

      return new CommonResponseDto(
        diagnostics,
        true,
        'Diagnostic data fetched successfully',
      );
    } catch (err) {
      return new CommonResponseDto(
        [],
        false,
        `Diagnostic failed: ${err.message}`,
      );
    }
  }

  // Helper method to execute query on all branches in parallel
  private async queryAllBranches<T>(
    queryFn: (connection: BranchConnection) => Promise<T>,
  ): Promise<T[]> {
    const promises = this.branchConnections.map((conn) => queryFn(conn));
    return Promise.all(promises);
  }

  // HOME V2 - Data from all 7 branches in parallel
  async Home1(
    pageOpt: ReportQueryDto,
    companyId?: number,
  ): Promise<CommonResponseDto> {
    try {
      // console.log('🔍 Home1 called with pageOpt:', pageOpt, 'companyId:', companyId);

      const date = new Date();
      const startDate = await this.formatDate(moment(date).startOf('day'));
      const endDate = await this.formatDate(moment(date).endOf('day'));
      date.setHours(0, 0, 0, 0);
      const sevenDays = new Date();
      sevenDays.setDate(date.getDate() - 6);
      sevenDays.setHours(0, 0, 0, 0);

      // Convert branchId to number if it's a string (from query params)
      const filterBranchId = pageOpt?.branchId
        ? Number(pageOpt.branchId)
        : undefined;

      // Execute queries on all branches in parallel
      const branchResults = await this.queryAllBranches(async (conn) => {
        const { sequelize } = conn;

        // console.log('📊 Branch', conn.id, conn.name, '- Checking if should query. filterBranchId:', filterBranchId);

        // If branchId filter is specified, skip other databases
        if (filterBranchId && conn.id !== filterBranchId) {
          return null;
        }

        // console.log('✅ Branch', conn.id, '- Querying for companyId:', conn.primaryBranchId);

        // Always filter by the primary branch ID for this database
        // Each database contains all branch data, so we filter by the specific companyId
        const companyFilter = 'AND companyId = ?';
        const params = [conn.primaryBranchId];

        // console.log('🔧 Query params - companyFilter:', companyFilter, 'params:', params);

        const todayResults = await sequelize.query<TodayStatsResult>(
          `
          SELECT
            COUNT(*) as todayorder,
            SUM(total) as todayamount
          FROM order_master
          WHERE DATE(createdAt) = CURDATE()
            AND orderStatus != 'cancelled'
            ${companyFilter}
        `,
          {
            replacements: params,
            type: QueryTypes.SELECT,
          },
        );
        const today = todayResults[0];

        // Yesterday's totals — for the day-over-day comparison on the home screen
        const yesterdayResults = await sequelize.query<TodayStatsResult>(
          `
          SELECT
            COUNT(*) as todayorder,
            SUM(total) as todayamount
          FROM order_master
          WHERE DATE(createdAt) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            AND orderStatus != 'cancelled'
            ${companyFilter}
        `,
          {
            replacements: params,
            type: QueryTypes.SELECT,
          },
        );
        const yesterday = yesterdayResults[0];

        // console.log('📈 Branch', conn.id, '- Today stats:', today);

        // Get last 7 days data using raw SQL
        const last7days = await sequelize.query<Last7DaysResult>(
          `
          SELECT
            DATE(createdAt) as label,
            SUM(total) as value
          FROM order_master
          WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            AND orderStatus != 'cancelled'
            ${companyFilter}
          GROUP BY DATE(createdAt)
          ORDER BY DATE(createdAt) ASC
        `,
          {
            replacements: params,
            type: QueryTypes.SELECT,
          },
        );

        // Get top branch using raw SQL
        // Note: We filter by primaryBranchId to get the branch data from this database
        const topBranchResults = await sequelize.query<TopBranchResult>(
          `
          SELECT
            om.companyId,
            SUM(om.total) as totalSales,
            COUNT(om.id) as totalOrders,
            cm.id as cm_id,
            cm.bname as cm_bname
          FROM order_master om
          LEFT JOIN company_master cm ON om.companyId = cm.id
          WHERE DATE(om.createdAt) = CURDATE()
            AND om.orderStatus != 'cancelled'
            ${companyFilter}
          GROUP BY om.companyId, cm.id
          ORDER BY SUM(om.total) DESC
          LIMIT 1
        `,
          {
            replacements: params,
            type: QueryTypes.SELECT,
          },
        );

        // Format to match expected structure
        const topBranch = topBranchResults[0]
          ? {
              companyId: topBranchResults[0].companyId,
              totalSales: topBranchResults[0].totalSales,
              totalOrders: topBranchResults[0].totalOrders,
              CompanyMaster: {
                id: topBranchResults[0].cm_id,
                bname: topBranchResults[0].cm_bname,
              },
            }
          : null;

        // Get top product using raw SQL
        // Note: We filter by primaryBranchId to get the top product for this branch
        const topProductResults = await sequelize.query<TopProductResult>(
          `
          SELECT
            oi.productId,
            SUM(oi.sp_price * oi.quantity) as totalAmount,
            SUM(oi.quantity) as totalSold,
            pm.idescription as pm_idescription,
            AVG(oi.sp_price) as pm_sp_price
          FROM order_items oi
          LEFT JOIN product_master pm ON oi.productId = pm.id
          INNER JOIN order_master om ON oi.orderId = om.id
          WHERE DATE(oi.createdAt) = CURDATE()
            AND (om.orderStatus != 'cancelled' OR om.orderStatus IS NULL)
            AND om.companyId = ?
          GROUP BY oi.productId, pm.idescription
          ORDER BY SUM(oi.quantity) DESC
          LIMIT 1
        `,
          {
            replacements: params,
            type: QueryTypes.SELECT,
          },
        );

        // Format to match expected structure
        const topProduct = topProductResults[0]
          ? {
              productId: topProductResults[0].productId,
              totalAmount: topProductResults[0].totalAmount,
              totalSold: topProductResults[0].totalSold,
              ProductMaster: {
                idescription: topProductResults[0].pm_idescription,
                sp_price: Number(topProductResults[0].pm_sp_price).toFixed(2),
              },
            }
          : null;

        // Get payment method breakdown for today
        const paymentResults = await sequelize.query<any>(
          `
          SELECT
            COALESCE(paymentMethod, 'Unmarked') as method,
            COUNT(*) as count,
            COALESCE(SUM(total), 0) as amount
          FROM order_master
          WHERE DATE(createdAt) = CURDATE()
            AND orderStatus != 'cancelled'
            ${companyFilter}
          GROUP BY paymentMethod
        `,
          {
            replacements: params,
            type: QueryTypes.SELECT,
          },
        );

        return {
          branchId: conn.id,
          branchName: conn.name,
          today,
          yesterday,
          last7days,
          topBranch,
          topProduct,
          paymentBreakdown: paymentResults,
        };
      });

      // Filter out null results (skipped branches)
      const validResults = branchResults.filter((r) => r !== null);
      // console.log('🔍 validResults.length:', validResults.length);
      // console.log('🔍 branchResults:', JSON.stringify(branchResults.map(r => r ? { branchId: r.branchId, today: r.today } : null), null, 2));

      // Aggregate data from all branches
      const totalTodayAmount = validResults.reduce(
        (sum, r) => sum + (Number(r.today?.todayamount) || 0),
        0,
      );
      const totalTodayOrder = validResults.reduce(
        (sum, r) => sum + (Number(r.today?.todayorder) || 0),
        0,
      );
      const totalYesterdayAmount = validResults.reduce(
        (sum, r) => sum + (Number(r.yesterday?.todayamount) || 0),
        0,
      );
      const totalYesterdayOrder = validResults.reduce(
        (sum, r) => sum + (Number(r.yesterday?.todayorder) || 0),
        0,
      );
      // console.log('🔍 Aggregated totals - Orders:', totalTodayOrder, 'Amount:', totalTodayAmount);

      // Merge chart data from all branches
      const chartDataMap = new Map<string, number>();
      validResults.forEach((result) => {
        result.last7days.forEach((item) => {
          const label = moment(item.label).format('D');
          const currentValue = chartDataMap.get(label) || 0;
          chartDataMap.set(label, currentValue + (Number(item.value) || 0));
        });
      });

      const formattedData = Array.from(chartDataMap.entries())
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => Number(a.label) - Number(b.label));

      // Find overall top branch across all databases
      const allBranches = validResults
        .filter((r) => r.topBranch)
        .map((r) => r.topBranch!);
      const topBranch = allBranches.reduce(
        (max, branch) => {
          if (!max) return branch;
          if (Number(branch.totalSales) > Number(max.totalSales)) {
            return branch;
          }
          return max;
        },
        null as (typeof allBranches)[0] | null,
      );

      // Find overall top product across all databases
      const allProducts = validResults
        .filter((r) => r.topProduct)
        .map((r) => r.topProduct!);
      const topProduct = allProducts.reduce(
        (max, product) => {
          if (!max) return product;
          if (Number(product.totalSold) > Number(max.totalSold)) {
            return product;
          }
          return max;
        },
        null as (typeof allProducts)[0] | null,
      );

      // Aggregate payment breakdown from all branches
      const paymentMap = new Map<string, { count: number; amount: number }>();
      validResults.forEach((r) => {
        r.paymentBreakdown?.forEach((p: any) => {
          const key = p.method || 'Unmarked';
          const current = paymentMap.get(key) || { count: 0, amount: 0 };
          paymentMap.set(key, {
            count: current.count + Number(p.count || 0),
            amount: current.amount + Number(p.amount || 0),
          });
        });
      });
      const paymentSummary = Array.from(paymentMap.entries()).map(
        ([method, data]) => ({
          method,
          count: data.count,
          amount: Number(data.amount.toFixed(2)),
        }),
      );

      const obj = {
        today_amount: totalTodayAmount,
        today_order: totalTodayOrder,
        yesterday_amount: totalYesterdayAmount,
        yesterday_order: totalYesterdayOrder,
        chart: formattedData,
        today_branch: topBranch,
        today_product: topProduct,
        payment_summary: paymentSummary,
      };

      return new CommonResponseDto(obj, true, 'Data fetch successfully');
    } catch (err) {
      return new CommonResponseDto({}, false, 'No Data Found');
    }
  }

  // REPORTS V2 - Monthly report from all 7 branches
  async Reports1(
    pageOpt: ReportQueryDto,
    companyId?: number,
  ): Promise<CommonResponseDto> {
    try {
      // Convert branchId to number if it's a string (from query params)
      const filterBranchId = pageOpt?.branchId
        ? Number(pageOpt.branchId)
        : undefined;

      const branchResults = await this.queryAllBranches(async (conn) => {
        // If branchId filter is specified, skip other databases
        if (filterBranchId && conn.id !== filterBranchId) {
          return null;
        }

        const DateCondition: any = {
          orderStatus: { [Op.ne]: 'cancelled' },
        };

        // Always filter by the primary branch ID for this database
        // Only use the companies configured in .env PRIMARY_BRANCH_ID
        DateCondition.companyId = conn.primaryBranchId;

        // FIXED: Use raw SQL query with conn.sequelize to ensure correct database
        // OrderMaster.findAll() was using the global connection, not conn-specific!
        // CONVERT_TZ ensures timezone conversion to IST before grouping by month
        const monthlyReport: any = await conn.sequelize.query(
          `
          SELECT
            DATE_FORMAT(CONVERT_TZ(createdAt, '+00:00', '+05:30'), '%Y-%m') AS month,
            SUM(total) AS totalSales,
            COUNT(id) AS totalOrders
          FROM order_master
          WHERE orderStatus != 'cancelled'
            AND companyId = ?
          GROUP BY DATE_FORMAT(CONVERT_TZ(createdAt, '+00:00', '+05:30'), '%Y-%m')
          ORDER BY DATE_FORMAT(CONVERT_TZ(createdAt, '+00:00', '+05:30'), '%Y-%m') DESC
          `,
          {
            replacements: [conn.primaryBranchId],
            type: QueryTypes.SELECT,
          },
        );

        return monthlyReport;
      });

      // Filter out null results and flatten
      const validResults = branchResults.filter((r) => r !== null).flat();

      // Aggregate by month across all branches
      const monthlyMap = new Map();
      validResults.forEach((item: any) => {
        const month = item.month;
        const current = monthlyMap.get(month) || {
          month,
          totalSales: 0,
          totalOrders: 0,
        };
        current.totalSales += Number(item.totalSales) || 0;
        current.totalOrders += Number(item.totalOrders) || 0;
        monthlyMap.set(month, current);
      });

      const monthlyReport = Array.from(monthlyMap.values()).sort((a, b) =>
        b.month.localeCompare(a.month),
      );

      return new CommonResponseDto(
        monthlyReport,
        true,
        'Data fetch successfully',
      );
    } catch (err) {
      return new CommonResponseDto({}, false, 'No Data Found');
    }
  }

  // BRANCH PICKER V2 - Get all branches (databases) for filtering
  // Note: Each DATABASE represents a physical branch location
  async BranchePicker1(
    pageOpt: ReportQueryDto,
    companyId?: number,
  ): Promise<CommonResponseDto> {
    try {
      // Return the list of database branches, not company_master
      // Each database connection represents a different physical branch
      const branches = this.branchConnections.map((conn) => ({
        id: conn.id, // Database ID (1-5)
        bname: conn.name, // Database name (e.g., "nalakath_pmna_oct_2025")
      }));

      return new CommonResponseDto(branches, true, 'Data fetch successfully');
    } catch (err) {
      return new CommonResponseDto([], false, 'No Data Found');
    }
  }

  // BRANCHES V2 - Get all branches (databases) with stats
  // Note: Each DATABASE represents a physical branch location
  async Branches1(
    pageOpt: ReportQueryDto,
    companyId?: number,
  ): Promise<CommonResponseDto> {
    try {
      // Convert branchId to number if it's a string (from query params)
      const filterBranchId = pageOpt?.branchId
        ? Number(pageOpt.branchId)
        : undefined;

      const branchResults = await this.queryAllBranches(async (conn) => {
        // If branchId filter is specified, skip other databases
        if (filterBranchId && conn.id !== filterBranchId) {
          return null;
        }

        const { sequelize } = conn;

        // Build date filters
        const dateFilters: string[] = ["orderStatus != 'cancelled'"];
        const params: any[] = [];

        // Always filter by the primary branch ID for this database
        // Each database contains all branch data, so we filter by the specific companyId
        dateFilters.push('companyId = ?');
        params.push(conn.primaryBranchId);

        if (pageOpt?.from_date && pageOpt?.to_date) {
          const startDate = await this.formatDate(pageOpt.from_date);
          const endDate = await this.formatDate(pageOpt.to_date);
          dateFilters.push('createdAt BETWEEN ? AND ?');
          params.push(startDate, endDate);
        }

        const whereClause = dateFilters.join(' AND ');

        // Search filter for branch name
        const nameFilter = pageOpt?.query
          ? `AND bname LIKE '%${pageOpt.query}%'`
          : '';

        interface BranchStatsResult {
          totalOrders: number;
          totalSales: number;
          bname: string;
          fulladdress: string;
          state: string;
        }

        const stats = await sequelize.query<BranchStatsResult>(
          `
          SELECT
            COUNT(om.id) as totalOrders,
            SUM(om.total) as totalSales,
            cm.bname,
            cm.fulladdress,
            cm.state
          FROM order_master om
          LEFT JOIN company_master cm ON om.companyId = cm.id
          WHERE ${whereClause}
          GROUP BY cm.id
        `,
          {
            replacements: params,
            type: QueryTypes.SELECT,
          },
        );

        if (stats.length === 0) {
          return null;
        }

        // Filter by name if query is provided
        if (pageOpt?.query) {
          const searchQuery = pageOpt.query.toLowerCase();
          const filtered = stats.filter(
            (s) => s.bname && s.bname.toLowerCase().includes(searchQuery),
          );
          if (filtered.length === 0) {
            return null;
          }
        }

        const result = stats[0];

        // Payment breakdown for this branch
        const paymentStats = await sequelize.query<any>(
          `
          SELECT
            COALESCE(paymentMethod, 'Unmarked') as method,
            COUNT(*) as count,
            COALESCE(SUM(total), 0) as amount
          FROM order_master
          WHERE ${whereClause}
          GROUP BY paymentMethod
        `,
          {
            replacements: params,
            type: QueryTypes.SELECT,
          },
        );

        return {
          companyId: conn.id,
          totalOrders: Number(result.totalOrders) || 0,
          totalSales: Number(result.totalSales) || 0,
          paymentBreakdown: paymentStats.map((p: any) => ({
            method: p.method || 'Unmarked',
            count: Number(p.count || 0),
            amount: Number(Number(p.amount || 0).toFixed(2)),
          })),
          CompanyMaster: {
            id: conn.id,
            bname: conn.name,
            fulladdress: result.fulladdress || '',
            state: result.state || '',
          },
        };
      });

      // Filter out null results
      const validBranches = branchResults.filter((b) => b !== null);

      // Sort by total sales
      const branches = validBranches.sort(
        (a, b) => Number(b.totalSales) - Number(a.totalSales),
      );

      return new CommonResponseDto(branches, true, 'Data fetch successfully');
    } catch (err) {
      return new CommonResponseDto([], false, 'No Data Found');
    }
  }

  // BRANCH DETAILS V2 - Get specific branch details from all databases
  async Branch_details1(
    id: number,
    pageOpt: ReportQueryDto,
    companyId?: number,
  ): Promise<CommonResponseDto> {
    try {
      // Default to last 30 days if no dates provided
      const defaultStartDate = moment()
        .subtract(30, 'days')
        .startOf('day')
        .toDate();
      const defaultEndDate = moment().endOf('day').toDate();

      const startDate = await this.formatDate(
        pageOpt?.from_date || defaultStartDate,
      );
      const endDate = await this.formatDate(pageOpt?.to_date || defaultEndDate);

      const branchResults = await this.queryAllBranches(async (conn) => {
        const { sequelize } = conn;

        // Match against the real companyId / primaryBranchId (e.g. 158 for
        // Perinthalmanna), not the connection array index. The home screen,
        // top-branch card, and branch picker all pass the actual companyId,
        // so `conn.id` (1..5) never matched — every branch returned empty
        // and the detail screen showed "no data".
        if (Number(conn.primaryBranchId) !== Number(id)) {
          return { data: [], totals: [], branch: null };
        }

        interface DailyDataResult {
          companyId: number;
          orderDate: string;
          totalOrders: number;
          totalSales: number;
        }

        interface TotalsResult {
          companyId: number;
          totalOrders: number;
          totalSales: number;
        }

        interface BranchResult {
          id: number;
          bname: string;
          [key: string]: any;
        }

        // Use primaryBranchId to filter data in this database
        const branchCompanyId = conn.primaryBranchId;

        // Query daily data
        const data = await sequelize.query<DailyDataResult>(
          `
          SELECT
            companyId,
            DATE(createdAt) as orderDate,
            COUNT(id) as totalOrders,
            SUM(total) as totalSales
          FROM order_master
          WHERE companyId = ?
            AND orderStatus != 'cancelled'
            AND createdAt BETWEEN ? AND ?
          GROUP BY DATE(createdAt)
          ORDER BY DATE(createdAt) DESC
        `,
          {
            replacements: [branchCompanyId, startDate, endDate],
            type: QueryTypes.SELECT,
          },
        );

        // Query totals
        const totals = await sequelize.query<TotalsResult>(
          `
          SELECT
            companyId,
            COUNT(id) as totalOrders,
            SUM(total) as totalSales
          FROM order_master
          WHERE companyId = ?
            AND orderStatus != 'cancelled'
            AND createdAt BETWEEN ? AND ?
          GROUP BY companyId
          ORDER BY SUM(total) DESC
        `,
          {
            replacements: [branchCompanyId, startDate, endDate],
            type: QueryTypes.SELECT,
          },
        );

        // Query branch details
        const branches = await sequelize.query<BranchResult>(
          `
          SELECT * FROM company_master WHERE id = ?
        `,
          {
            replacements: [branchCompanyId],
            type: QueryTypes.SELECT,
          },
        );

        const branch = branches.length > 0 ? branches[0] : null;

        return { data, totals, branch };
      });

      // Aggregate data from all branches
      const allData = branchResults.flatMap((r) => r.data);
      const allTotals = branchResults.flatMap((r) => r.totals);
      const branch = branchResults.find((r) => r.branch)?.branch;

      // Merge data by date
      const dataMap = new Map();
      allData.forEach((item: any) => {
        const date = item.orderDate;
        const current = dataMap.get(date) || {
          companyId: id,
          orderDate: date,
          totalOrders: 0,
          totalSales: 0,
        };
        current.totalOrders += Number(item.totalOrders) || 0;
        current.totalSales += Number(item.totalSales) || 0;
        dataMap.set(date, current);
      });

      const data = Array.from(dataMap.values()).sort((a, b) =>
        b.orderDate.localeCompare(a.orderDate),
      );

      // Aggregate totals
      const totalOrders = allTotals.reduce(
        (sum, t: any) => sum + (Number(t.totalOrders) || 0),
        0,
      );
      const totalSales = allTotals.reduce(
        (sum, t: any) => sum + (Number(t.totalSales) || 0),
        0,
      );

      const obj = {
        totals: [{ companyId: id, totalOrders, totalSales }],
        branch,
        data,
      };

      return new CommonResponseDto(obj, true, 'Data fetch successfully');
    } catch (err) {
      return new CommonResponseDto({}, false, 'No Data Found');
    }
  }

  // PRODUCTS V2 - Get all products from all databases
  async Products1(
    pageOpt: ReportQueryDto,
    companyId?: number,
  ): Promise<CommonResponseDto> {
    try {
      // console.log('🔍 Products1 called with:', { pageOpt, companyId });

      // Convert branchId to number if it's a string (from query params)
      const filterBranchId = pageOpt?.branchId
        ? Number(pageOpt.branchId)
        : undefined;

      const branchResults = await this.queryAllBranches(async (conn) => {
        const { sequelize } = conn;

        // If branchId filter is specified, skip other databases
        if (filterBranchId && conn.id !== filterBranchId) {
          return [];
        }

        // Build SQL filters — filter by branch and date on order_master only
        // No status filter here; status breakdown is handled via conditional aggregation
        const filters: string[] = [];
        const params: any[] = [];

        // Always filter by the primary branch ID for this database
        filters.push('om.companyId = ?');
        params.push(conn.primaryBranchId);

        // Default to today's date if no dates provided
        const today = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();
        const startDate = await this.formatDate(pageOpt?.from_date || today);
        const endDate = await this.formatDate(pageOpt?.to_date || todayEnd);
        filters.push('om.createdAt BETWEEN ? AND ?');
        params.push(startDate, endDate);

        // Search filter
        let searchFilter = '';
        if (pageOpt?.query) {
          searchFilter = 'AND pm.idescription LIKE ?';
          params.push(`%${pageOpt.query}%`);
        }

        const whereClause = filters.join(' AND ');

        interface ProductResult {
          productId: number;
          idescription: string;
          sp_price: number;
          current_price: number;
          average_price: number;
          totalAmount: number;
          totalSold: number;
          cancelledQty: number;
          pendingQty: number;
          unmarkedQty: number;
          branchId: number;
        }

        const products = await sequelize.query<ProductResult>(
          `
          SELECT
            oi.productId,
            MAX(CASE
              WHEN pc.is_show_in_report = 1
              THEN CONCAT(pm.idescription, ' - ', pc.alias_name)
              ELSE pm.idescription
            END) as idescription,
            MAX(pm.sp_price) as sp_price,
            MAX(pm.sp_price) as current_price,
            AVG(CASE WHEN om.orderStatus IN ('finished','billed','served') THEN oi.sp_price END) as average_price,
            SUM(CASE WHEN om.orderStatus IN ('finished','billed','served') THEN oi.sp_price * oi.quantity ELSE 0 END) as totalAmount,
            SUM(CASE WHEN om.orderStatus IN ('finished','billed','served') THEN oi.quantity ELSE 0 END) as totalSold,
            SUM(CASE WHEN om.orderStatus = 'cancelled' THEN oi.quantity ELSE 0 END) as cancelledQty,
            SUM(CASE WHEN om.orderStatus IN ('pending','started') THEN oi.quantity ELSE 0 END) as pendingQty,
            SUM(CASE WHEN om.orderStatus IS NULL OR om.orderStatus NOT IN ('finished','billed','served','cancelled','pending','started') THEN oi.quantity ELSE 0 END) as unmarkedQty,
            ? as branchId
          FROM order_items oi
          INNER JOIN order_master om ON oi.orderId = om.id
          INNER JOIN product_master pm ON oi.productId = pm.id
          LEFT JOIN product_category pc ON pm.product_category = pc.id
          WHERE ${whereClause} ${searchFilter}
          GROUP BY oi.productId
          ORDER BY SUM(CASE WHEN om.orderStatus IN ('finished','billed','served') THEN oi.quantity ELSE 0 END) DESC
        `,
          {
            replacements: [conn.id, ...params],
            type: QueryTypes.SELECT,
          },
        );

        // Get payment breakdown per product (only for completed orders)
        const paymentByProduct = await sequelize.query<any>(
          `
          SELECT
            oi.productId,
            COALESCE(om.paymentMethod, 'Unmarked') as method,
            COALESCE(SUM(oi.sp_price * oi.quantity), 0) as amount,
            SUM(oi.quantity) as qty
          FROM order_items oi
          INNER JOIN order_master om ON oi.orderId = om.id
          INNER JOIN product_master pm ON oi.productId = pm.id
          WHERE ${whereClause} ${searchFilter}
            AND om.orderStatus IN ('finished','billed','served')
          GROUP BY oi.productId, om.paymentMethod
        `,
          {
            replacements: params,
            type: QueryTypes.SELECT,
          },
        );

        // Group payment data by productId
        const paymentMap = new Map<number, any[]>();
        paymentByProduct.forEach((p: any) => {
          const arr = paymentMap.get(p.productId) || [];
          arr.push({
            method: p.method || 'Unmarked',
            amount: Number(Number(p.amount || 0).toFixed(2)),
            qty: Number(p.qty || 0),
          });
          paymentMap.set(p.productId, arr);
        });

        // Transform to match app's expected structure with nested productMaster
        const transformedProducts = products.map((product) => {
          const statusBreakdown: { status: string; qty: number }[] = [];
          const sold = Number(product.totalSold) || 0;
          const cancelled = Number(product.cancelledQty) || 0;
          const pending = Number(product.pendingQty) || 0;
          const unmarked = Number(product.unmarkedQty) || 0;
          if (sold > 0) statusBreakdown.push({ status: 'sold', qty: sold });
          if (pending > 0) statusBreakdown.push({ status: 'pending', qty: pending });
          if (cancelled > 0) statusBreakdown.push({ status: 'cancelled', qty: cancelled });
          if (unmarked > 0) statusBreakdown.push({ status: 'unmarked', qty: unmarked });

          return {
            productId: product.productId,
            totalAmount: product.totalAmount,
            totalSold: sold,
            totalQty: sold + cancelled + pending + unmarked,
            branchId: product.branchId,
            statusBreakdown,
            paymentBreakdown: paymentMap.get(product.productId) || [],
            productMaster: {
              idescription: product.idescription,
              sp_price: Number(product.sp_price).toFixed(2),
              current_price: Number(product.current_price).toFixed(2),
              average_price: Number(product.average_price || 0).toFixed(2),
            },
          };
        });

        return transformedProducts;
      });

      // Flatten all products
      const allProducts = branchResults.flat();

      return new CommonResponseDto(
        allProducts,
        true,
        'Data fetch successfully',
      );
    } catch (err) {
      return new CommonResponseDto({}, false, 'No Data Found');
    }
  }

  // EXPORT PRODUCTS AS PDF
  async exportProductsPDF(
    pageOpt: ReportQueryDto,
    companyId: number,
    res: any,
  ): Promise<void> {
    try {
      const result = await this.Products1(pageOpt, companyId);
      const products = result?.data || [];

      const branchName =
        this.branchConnections.find(
          (c) => c.id === Number(pageOpt?.branchId),
        )?.name || 'All Branches';
      const fromDate = pageOpt?.from_date
        ? moment(pageOpt.from_date).format('DD/MM/YYYY')
        : moment().format('DD/MM/YYYY');
      const toDate = pageOpt?.to_date
        ? moment(pageOpt.to_date).format('DD/MM/YYYY')
        : moment().format('DD/MM/YYYY');

      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ size: 'A4', margin: 40 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Products_${branchName.replace(/[^a-zA-Z0-9]/g, '_')}_${moment().format('DDMMYYYY')}.pdf`,
      );
      doc.pipe(res);

      // Header
      doc
        .fontSize(18)
        .fillColor('#18a762')
        .text('Product Sales Report', { align: 'center' });
      doc
        .fontSize(10)
        .fillColor('grey')
        .text(`${branchName}  |  ${fromDate} - ${toDate}`, {
          align: 'center',
        });
      doc.moveDown(1);

      // Table columns: #, Product, Price, Sold, Total, Cash, UPI
      const colX = [40, 58, 230, 290, 340, 420, 490];
      const colW = [16, 168, 55, 45, 75, 65, 65];
      const colHeaders = ['#', 'Product', 'Price', 'Sold', 'Total', 'Cash', 'UPI'];
      const colAlign: any[] = ['left', 'left', 'right', 'right', 'right', 'right', 'right'];
      const headerY = doc.y;
      doc.save();
      doc.rect(38, headerY, 520, 20).fill('#18a762');
      doc.restore();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#fff');
      for (let i = 0; i < colHeaders.length; i++) {
        doc.text(colHeaders[i], colX[i], headerY + 6, { width: colW[i], align: colAlign[i] });
      }
      doc.x = 40;
      doc.y = headerY + 22;

      // Table rows
      let totalSales = 0;
      let totalUnits = 0;
      let totalCash = 0;
      let totalUpi = 0;

      products.forEach((item: any, index: number) => {
        const name = item?.productMaster?.idescription || '';
        const price = Number(item?.productMaster?.sp_price || 0).toFixed(2);
        const sold = Number(item?.totalSold || 0);
        const total = Number(item?.totalAmount || 0).toFixed(2);

        const cashAmt = (item?.paymentBreakdown || [])
          .filter((p: any) => p.method === 'Cash')
          .reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
        const upiAmt = (item?.paymentBreakdown || [])
          .filter((p: any) => p.method === 'UPI')
          .reduce((s: number, p: any) => s + Number(p.amount || 0), 0);

        totalSales += Number(item?.totalAmount || 0);
        totalUnits += sold;
        totalCash += cashAmt;
        totalUpi += upiAmt;

        if (doc.y > 750) {
          doc.addPage();
        }

        const rowY = doc.y;
        if (index % 2 === 0) {
          doc.save();
          doc.rect(38, rowY, 520, 18).fill('#f9f9f9');
          doc.restore();
        }
        doc.font('Helvetica').fontSize(8).fillColor('#333');
        doc.text(String(index + 1), colX[0], rowY + 4, { width: colW[0] });
        doc.text(name, colX[1], rowY + 4, { width: colW[1] });
        doc.text(price, colX[2], rowY + 4, { width: colW[2], align: 'right' });
        doc.text(String(sold), colX[3], rowY + 4, { width: colW[3], align: 'right' });
        doc.text(total, colX[4], rowY + 4, { width: colW[4], align: 'right' });
        doc.fillColor(cashAmt > 0 ? '#18a762' : '#ccc');
        doc.text(cashAmt > 0 ? cashAmt.toFixed(0) : '-', colX[5], rowY + 4, { width: colW[5], align: 'right' });
        doc.fillColor(upiAmt > 0 ? '#3b6fd4' : '#ccc');
        doc.text(upiAmt > 0 ? upiAmt.toFixed(0) : '-', colX[6], rowY + 4, { width: colW[6], align: 'right' });
        doc.x = 40;
        doc.y = rowY + 18;
      });

      // Footer totals
      doc.moveDown(0.3);
      doc.save();
      doc.rect(38, doc.y, 520, 1).fill('#18a762');
      doc.restore();
      doc.moveDown(0.3);
      const footY = doc.y;
      doc.fontSize(9).fillColor('#000').font('Helvetica-Bold');
      doc.text('Total', colX[1], footY, { width: colW[1] });
      doc.text(String(totalUnits), colX[3], footY, { width: colW[3], align: 'right' });
      doc.text(totalSales.toFixed(2), colX[4], footY, { width: colW[4], align: 'right' });
      doc.fillColor('#18a762');
      doc.text(totalCash > 0 ? totalCash.toFixed(0) : '-', colX[5], footY, { width: colW[5], align: 'right' });
      doc.fillColor('#3b6fd4');
      doc.text(totalUpi > 0 ? totalUpi.toFixed(0) : '-', colX[6], footY, { width: colW[6], align: 'right' });

      doc.end();
    } catch (err) {
      console.log('PDF export error:', err);
      res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
  }

  // EXPORT PRODUCTS AS HTML (for mobile browser)
  async exportProductsHTML(
    pageOpt: ReportQueryDto,
    companyId: number,
    res: any,
  ): Promise<void> {
    try {
      const result = await this.Products1(pageOpt, companyId);
      const products = result?.data || [];

      const branchName =
        this.branchConnections.find(
          (c) => c.id === Number(pageOpt?.branchId),
        )?.name || 'All Branches';
      const fromDate = pageOpt?.from_date
        ? moment(pageOpt.from_date).format('DD/MM/YYYY')
        : moment().format('DD/MM/YYYY');
      const toDate = pageOpt?.to_date
        ? moment(pageOpt.to_date).format('DD/MM/YYYY')
        : moment().format('DD/MM/YYYY');

      let totalSales = 0;
      let totalUnits = 0;

      let rows = '';
      products.forEach((item: any, index: number) => {
        const name = item?.productMaster?.idescription || '';
        const price = Number(item?.productMaster?.sp_price || 0).toFixed(2);
        const sold = Number(item?.totalSold || 0);
        const total = Number(item?.totalAmount || 0).toFixed(2);
        const paidMethods = (item?.paymentBreakdown || [])
          .filter((p: any) => p.method !== 'Unmarked');
        let paymentHtml = '';
        if (paidMethods.length > 0) {
          paymentHtml = paidMethods
            .map((p: any) => {
              const color = p.method === 'Cash' ? '#18a762' : '#3b6fd4';
              const bg = p.method === 'Cash' ? '#f0faf5' : '#eef4ff';
              return `<span class="chip" style="background:${bg};color:${color};">${p.method}: ${Number(p.amount || 0).toFixed(0)}</span>`;
            })
            .join(' ');
        } else {
          paymentHtml = '<span class="chip unmarked">Not marked</span>';
        }

        totalSales += Number(item?.totalAmount || 0);
        totalUnits += sold;

        rows += `<tr>
          <td>${index + 1}</td>
          <td>${name}</td>
          <td class="r">${price}</td>
          <td class="c">${sold}</td>
          <td class="r">${total}</td>
          <td class="payment">${paymentHtml}</td>
        </tr>`;
      });

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Product Sales Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #f5f5f5; color: #333; }
    .header { background: #18a762; color: #fff; padding: 20px; text-align: center; }
    .header h1 { font-size: 18px; margin-bottom: 4px; }
    .header p { font-size: 12px; opacity: 0.85; }
    .content { padding: 10px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; font-size: 12px; }
    th { background: #18a762; color: #fff; padding: 10px 8px; text-align: left; font-weight: 600; }
    td { padding: 9px 8px; border-bottom: 1px solid #f0f0f0; }
    tr:nth-child(even) { background: #fafafa; }
    .r { text-align: right; }
    .c { text-align: center; }
    .footer td { font-weight: 700; background: #f0faf5; border-top: 2px solid #18a762; }
    .payment { white-space: nowrap; }
    .chip { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin: 1px 2px; }
    .chip.unmarked { background: #f5f5f5; color: #ccc; font-weight: 400; }
    .actions { padding: 15px 10px; text-align: center; }
    .btn { display: inline-block; background: #18a762; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; }
    @media print { .actions { display: none; } body { background: #fff; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Product Sales Report</h1>
    <p>${branchName} &nbsp;|&nbsp; ${fromDate} - ${toDate}</p>
  </div>
  <div class="content">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th class="r">Price</th>
          <th class="c">Sold</th>
          <th class="r">Total</th>
          <th>Payment</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr class="footer">
          <td colspan="3">Total</td>
          <td class="c">${totalUnits}</td>
          <td class="r">${totalSales.toFixed(2)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  </div>
  <div class="actions">
    <a class="btn" href="javascript:window.print()">Print / Save as PDF</a>
  </div>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      console.log('HTML export error:', err);
      res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
  }

  // PRODUCTS CATEGORY-WISE V2 - Get products grouped by category with totals
  async ProductsCategoryWise(
    pageOpt: ReportQueryDto,
    companyId?: number,
  ): Promise<CommonResponseDto> {
    try {
      // Convert branchId to number if it's a string (from query params)
      const filterBranchId = pageOpt?.branchId
        ? Number(pageOpt.branchId)
        : undefined;

      const branchResults = await this.queryAllBranches(async (conn) => {
        const { sequelize } = conn;

        // If branchId filter is specified, skip other databases
        if (filterBranchId && conn.id !== filterBranchId) {
          return [];
        }

        // Build SQL filters — no status filter; handled via conditional aggregation
        const filters: string[] = [];
        const params: any[] = [];

        // Always filter by the primary branch ID for this database
        filters.push('om.companyId = ?');
        params.push(conn.primaryBranchId);

        // Default to today's date if no dates provided
        const today = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();
        const startDate = await this.formatDate(pageOpt?.from_date || today);
        const endDate = await this.formatDate(pageOpt?.to_date || todayEnd);
        filters.push('om.createdAt BETWEEN ? AND ?');
        params.push(startDate, endDate);

        // Search filter
        let searchFilter = '';
        if (pageOpt?.query) {
          searchFilter = 'AND pm.idescription LIKE ?';
          params.push(`%${pageOpt.query}%`);
        }

        const whereClause = filters.join(' AND ');

        interface CategoryProductResult {
          categoryId: number;
          categoryName: string;
          productId: number;
          idescription: string;
          sp_price: number;
          current_price: number;
          average_price: number;
          totalAmount: number;
          totalSold: number;
          cancelledQty: number;
          pendingQty: number;
          unmarkedQty: number;
          branchId: number;
        }

        const products = await sequelize.query<CategoryProductResult>(
          `
          SELECT
            COALESCE(pc.id, 0) as categoryId,
            COALESCE(pc.category, 'Uncategorized') as categoryName,
            oi.productId,
            MAX(CASE
              WHEN pc.is_show_in_report = 1
              THEN CONCAT(pm.idescription, ' - ', pc.alias_name)
              ELSE pm.idescription
            END) as idescription,
            MAX(pm.sp_price) as sp_price,
            MAX(pm.sp_price) as current_price,
            AVG(CASE WHEN om.orderStatus IN ('finished','billed','served') THEN oi.sp_price END) as average_price,
            SUM(CASE WHEN om.orderStatus IN ('finished','billed','served') THEN oi.sp_price * oi.quantity ELSE 0 END) as totalAmount,
            SUM(CASE WHEN om.orderStatus IN ('finished','billed','served') THEN oi.quantity ELSE 0 END) as totalSold,
            SUM(CASE WHEN om.orderStatus = 'cancelled' THEN oi.quantity ELSE 0 END) as cancelledQty,
            SUM(CASE WHEN om.orderStatus IN ('pending','started') THEN oi.quantity ELSE 0 END) as pendingQty,
            SUM(CASE WHEN om.orderStatus IS NULL OR om.orderStatus NOT IN ('finished','billed','served','cancelled','pending','started') THEN oi.quantity ELSE 0 END) as unmarkedQty,
            ? as branchId
          FROM order_items oi
          INNER JOIN order_master om ON oi.orderId = om.id
          INNER JOIN product_master pm ON oi.productId = pm.id
          LEFT JOIN product_category pc ON pm.product_category = pc.id
          WHERE ${whereClause} ${searchFilter}
          GROUP BY pc.id, pc.category, oi.productId
          ORDER BY pc.category ASC, SUM(CASE WHEN om.orderStatus IN ('finished','billed','served') THEN oi.quantity ELSE 0 END) DESC
        `,
          {
            replacements: [conn.id, ...params],
            type: QueryTypes.SELECT,
          },
        );

        // Get payment breakdown per product (completed orders only)
        const paymentByProduct = await sequelize.query<any>(
          `
          SELECT
            oi.productId,
            COALESCE(om.paymentMethod, 'Unmarked') as method,
            COALESCE(SUM(oi.sp_price * oi.quantity), 0) as amount,
            SUM(oi.quantity) as qty
          FROM order_items oi
          INNER JOIN order_master om ON oi.orderId = om.id
          INNER JOIN product_master pm ON oi.productId = pm.id
          WHERE ${whereClause} ${searchFilter}
            AND om.orderStatus IN ('finished','billed','served')
          GROUP BY oi.productId, om.paymentMethod
        `,
          {
            replacements: params,
            type: QueryTypes.SELECT,
          },
        );

        const paymentMap = new Map<number, any[]>();
        paymentByProduct.forEach((p: any) => {
          const arr = paymentMap.get(p.productId) || [];
          arr.push({
            method: p.method || 'Unmarked',
            amount: Number(Number(p.amount || 0).toFixed(2)),
            qty: Number(p.qty || 0),
          });
          paymentMap.set(p.productId, arr);
        });

        return products.map((p: any) => {
          const sold = Number(p.totalSold) || 0;
          const cancelled = Number(p.cancelledQty) || 0;
          const pending = Number(p.pendingQty) || 0;
          const unmarked = Number(p.unmarkedQty) || 0;
          const statusBreakdown: { status: string; qty: number }[] = [];
          if (sold > 0) statusBreakdown.push({ status: 'sold', qty: sold });
          if (pending > 0) statusBreakdown.push({ status: 'pending', qty: pending });
          if (cancelled > 0) statusBreakdown.push({ status: 'cancelled', qty: cancelled });
          if (unmarked > 0) statusBreakdown.push({ status: 'unmarked', qty: unmarked });
          return {
            ...p,
            totalSold: sold,
            statusBreakdown,
            paymentBreakdown: paymentMap.get(p.productId) || [],
          };
        });
      });

      // Flatten all products
      const allProducts = branchResults.flat();

      // Group products by category and calculate category totals
      const categoryMap = new Map<
        number,
        {
          categoryId: number;
          categoryName: string;
          totalAmount: number;
          totalSold: number;
          products: any[];
        }
      >();

      allProducts.forEach((product: any) => {
        const categoryId = product.categoryId || 0;
        const categoryName = product.categoryName || 'Uncategorized';

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            categoryId,
            categoryName,
            totalAmount: 0,
            totalSold: 0,
            products: [],
          });
        }

        const category = categoryMap.get(categoryId)!;
        category.totalAmount += Number(product.totalAmount) || 0;
        category.totalSold += Number(product.totalSold) || 0;
        category.products.push({
          productId: product.productId,
          totalAmount: product.totalAmount,
          totalSold: product.totalSold,
          branchId: product.branchId,
          statusBreakdown: product.statusBreakdown || [],
          paymentBreakdown: product.paymentBreakdown || [],
          productMaster: {
            idescription: product.idescription,
            sp_price: Number(product.sp_price).toFixed(2),
            current_price: Number(product.current_price).toFixed(2),
            average_price: Number(product.average_price || 0).toFixed(2),
          },
        });
      });

      // Convert map to array and calculate grand totals + aggregate payment per category
      const categories = Array.from(categoryMap.values()).map((cat) => {
        // Aggregate payment breakdown from all products in this category
        const paymentAgg = new Map<string, { count: number; amount: number }>();
        cat.products.forEach((p: any) => {
          (p.paymentBreakdown || []).forEach((pb: any) => {
            const current = paymentAgg.get(pb.method) || { count: 0, amount: 0 };
            paymentAgg.set(pb.method, {
              count: current.count + (pb.qty || 0),
              amount: current.amount + (pb.amount || 0),
            });
          });
        });
        const paymentBreakdown = Array.from(paymentAgg.entries()).map(
          ([method, data]) => ({
            method,
            amount: Number(data.amount.toFixed(2)),
            qty: data.count,
          }),
        );

        return {
          ...cat,
          totalAmount: Number(cat.totalAmount.toFixed(2)),
          productCount: cat.products.length,
          paymentBreakdown,
        };
      });

      // Sort categories by total amount descending
      categories.sort((a, b) => b.totalAmount - a.totalAmount);

      // Calculate grand totals
      const grandTotalAmount = categories.reduce(
        (sum, cat) => sum + cat.totalAmount,
        0,
      );
      const grandTotalSold = categories.reduce(
        (sum, cat) => sum + cat.totalSold,
        0,
      );
      const totalProducts = categories.reduce(
        (sum, cat) => sum + cat.productCount,
        0,
      );

      const result = {
        categories,
        summary: {
          totalCategories: categories.length,
          totalProducts,
          grandTotalAmount: Number(grandTotalAmount.toFixed(2)),
          grandTotalSold,
        },
      };

      return new CommonResponseDto(result, true, 'Data fetch successfully');
    } catch (err) {
      console.error('ProductsCategoryWise error:', err);
      return new CommonResponseDto({}, false, 'No Data Found');
    }
  }

  // PRODUCT DETAILS V2 - Get specific product details from all databases
  async Product_details1(
    id: number,
    pageOpt: ReportQueryDto,
    companyId?: number,
  ): Promise<CommonResponseDto> {
    try {
      // Default to last 30 days if no dates provided
      const defaultStartDate = moment()
        .subtract(30, 'days')
        .startOf('day')
        .toDate();
      const defaultEndDate = moment().endOf('day').toDate();

      const startDate = await this.formatDate(
        pageOpt?.from_date || defaultStartDate,
      );
      const endDate = await this.formatDate(pageOpt?.to_date || defaultEndDate);

      // Convert branchId to number if it's a string (from query params)
      const filterBranchId = pageOpt?.branchId
        ? Number(pageOpt.branchId)
        : undefined;

      const branchResults = await this.queryAllBranches(async (conn) => {
        const { sequelize } = conn;

        // If branchId filter is specified, skip other databases
        if (filterBranchId && conn.id !== filterBranchId) {
          return { data: [], totalQuantity: [], product: null };
        }

        interface DailyProductResult {
          productId: number;
          totalAmount: number;
          prodDate: string;
          totalOrders: number;
          totalQuantity: number;
          averagePrice: number;
        }

        interface TotalQuantityResult {
          productId: number;
          totalSold: number;
          averagePrice: number;
        }

        interface ProductResult {
          id: number;
          idescription: string;
          [key: string]: any;
        }

        // Build WHERE conditions
        const conditions = [
          'oi.productId = ?',
          "(oi.orderStatus != 'cancelled' OR oi.orderStatus IS NULL)",
          'oi.createdAt BETWEEN ? AND ?',
        ];
        const params = [id, startDate, endDate];

        // Always filter by the primary branch ID for this database
        // Each database contains all branch data, so we filter by the specific companyId
        conditions.push('oi.companyId = ?');
        params.push(conn.primaryBranchId);

        const whereClause = conditions.join(' AND ');

        // Query daily data
        const data = await sequelize.query<DailyProductResult>(
          `
          SELECT
            oi.productId,
            SUM(oi.sp_price * oi.quantity) as totalAmount,
            DATE(oi.createdAt) as prodDate,
            COUNT(oi.id) as totalOrders,
            SUM(oi.quantity) as totalQuantity,
            AVG(oi.sp_price) as averagePrice
          FROM order_items oi
          WHERE ${whereClause}
          GROUP BY DATE(oi.createdAt)
          ORDER BY DATE(oi.createdAt) DESC
        `,
          {
            replacements: params,
            type: QueryTypes.SELECT,
          },
        );

        // Query total quantity
        const totalQuantity = await sequelize.query<TotalQuantityResult>(
          `
          SELECT
            oi.productId,
            SUM(oi.quantity) as totalSold,
            AVG(oi.sp_price) as averagePrice
          FROM order_items oi
          WHERE ${whereClause}
          GROUP BY oi.productId
          ORDER BY SUM(oi.quantity) DESC
        `,
          {
            replacements: params,
            type: QueryTypes.SELECT,
          },
        );

        // Query product details
        const products = await sequelize.query<ProductResult>(
          `
          SELECT * FROM product_master WHERE id = ?
        `,
          {
            replacements: [id],
            type: QueryTypes.SELECT,
          },
        );

        const product = products.length > 0 ? products[0] : null;

        return { data, totalQuantity, product };
      });

      // Aggregate data
      const allData = branchResults.flatMap((r) => r.data);
      const allTotalQuantity = branchResults.flatMap((r) => r.totalQuantity);
      const product = branchResults.find((r) => r.product)?.product;

      // Merge data by date
      const dataMap = new Map();
      allData.forEach((item: any) => {
        const date = item.prodDate;
        const current = dataMap.get(date) || {
          productId: id,
          prodDate: date,
          totalAmount: 0,
          totalOrders: 0,
          totalQuantity: 0,
          averagePrice: 0,
          priceCount: 0,
        };
        current.totalAmount += Number(item.totalAmount) || 0;
        current.totalOrders += Number(item.totalOrders) || 0;
        current.totalQuantity += Number(item.totalQuantity) || 0;
        // Calculate weighted average for price
        if (item.averagePrice) {
          current.averagePrice =
            (current.averagePrice * current.priceCount +
              Number(item.averagePrice)) /
            (current.priceCount + 1);
          current.priceCount += 1;
        }
        dataMap.set(date, current);
      });

      const data = Array.from(dataMap.values())
        .map((item) => ({
          productId: item.productId,
          prodDate: item.prodDate,
          totalAmount: item.totalAmount,
          totalOrders: item.totalOrders,
          totalQuantity: item.totalQuantity,
          averagePrice: Number(item.averagePrice).toFixed(2),
        }))
        .sort((a, b) => b.prodDate.localeCompare(a.prodDate));

      // Aggregate total quantity and average price
      const totalSold = allTotalQuantity.reduce(
        (sum, t: any) => sum + (Number(t.totalSold) || 0),
        0,
      );
      const averagePrice =
        allTotalQuantity.length > 0
          ? allTotalQuantity.reduce(
              (sum, t: any) => sum + (Number(t.averagePrice) || 0),
              0,
            ) / allTotalQuantity.length
          : 0;

      const obj = {
        totalQuantity: [
          {
            productId: id,
            totalSold,
            averagePrice: Number(averagePrice).toFixed(2),
          },
        ],
        product,
        data,
      };

      return new CommonResponseDto(obj, true, 'Data fetch successfully');
    } catch (err) {
      return new CommonResponseDto({}, false, 'No Data Found');
    }
  }

  // STAFF DIAGNOSTIC - Check table structure for staff tables
  async getStaffDiagnostic(companyId: number): Promise<CommonResponseDto> {
    try {
      const connection = this.branchConnections.find(
        (conn) => conn.primaryBranchId === companyId,
      );

      if (!connection) {
        return new CommonResponseDto(
          [],
          false,
          `Company ${companyId} not found`,
        );
      }

      const { sequelize } = connection;

      // Check user table structure - just get column names
      const userColumns = await sequelize.query(
        `DESCRIBE user`,
        { type: QueryTypes.SELECT },
      );

      // Check contact_master table structure - just get column names
      const contactColumns = await sequelize.query(
        `DESCRIBE contact_master`,
        { type: QueryTypes.SELECT },
      );

      // Get staff IDs from order_master (just 2)
      const staffIds = await sequelize.query(
        `SELECT DISTINCT adminId FROM order_master WHERE companyId = :companyId AND adminId IS NOT NULL LIMIT 2`,
        {
          replacements: { companyId },
          type: QueryTypes.SELECT,
        },
      );

      // Try different join possibilities
      const staffIdsArray = staffIds.map((s: any) => s.adminId);
      let matchByContactId = [];
      let matchByStaffId = [];
      let matchByAdminId = [];
      let allStaffInCompany = [];

      if (staffIdsArray.length > 0) {
        // Try joining by contact_master.id
        matchByContactId = await sequelize.query(
          `SELECT id, staffId, adminid, name, email, mobile FROM contact_master WHERE id IN (:staffIds) AND companyid = :companyId`,
          {
            replacements: { staffIds: staffIdsArray, companyId },
            type: QueryTypes.SELECT,
          },
        );

        // Try joining by contact_master.staffId
        matchByStaffId = await sequelize.query(
          `SELECT id, staffId, adminid, name, email, mobile FROM contact_master WHERE staffId IN (:staffIds) AND companyid = :companyId`,
          {
            replacements: { staffIds: staffIdsArray, companyId },
            type: QueryTypes.SELECT,
          },
        );

        // Try joining by contact_master.adminid
        matchByAdminId = await sequelize.query(
          `SELECT id, staffId, adminid, name, email, mobile FROM contact_master WHERE adminid IN (:staffIds) AND companyid = :companyId`,
          {
            replacements: { staffIds: staffIdsArray, companyId },
            type: QueryTypes.SELECT,
          },
        );
      }

      // Get all staff records for this company to see what's available
      allStaffInCompany = await sequelize.query(
        `SELECT id, staffId, adminid, name, email FROM contact_master WHERE companyid = :companyId LIMIT 5`,
        {
          replacements: { companyId },
          type: QueryTypes.SELECT,
        },
      );

      // Extract just column names
      const userColumnNames = userColumns.map((col: any) => col.Field);
      const contactColumnNames = contactColumns.map((col: any) => col.Field);

      return new CommonResponseDto(
        {
          userTableColumns: userColumnNames,
          contactMasterColumns: contactColumnNames,
          staffIdsInOrders: staffIds,
          matchByContactId: matchByContactId,
          matchByStaffId: matchByStaffId,
          matchByAdminId: matchByAdminId,
          allStaffInCompany: allStaffInCompany,
        },
        true,
        'Staff diagnostic data fetched successfully',
      );
    } catch (err) {
      return new CommonResponseDto(
        {},
        false,
        `Failed to fetch diagnostic: ${err.message}`,
      );
    }
  }

  // STAFF LIST V2 - Get all staff who took orders in a specific branch
  async getStaffList(companyId: number): Promise<CommonResponseDto> {
    try {
      // Find the connection for this companyId (primaryBranchId)
      const connection = this.branchConnections.find(
        (conn) => conn.primaryBranchId === companyId,
      );

      if (!connection) {
        return new CommonResponseDto(
          [],
          false,
          `Company ${companyId} not found`,
        );
      }

      const { sequelize, primaryBranchId } = connection;

      // Interface for staff list results
      interface StaffListResult {
        staffId: number;
        staffName: string | null;
        staffEmail: string | null;
        staffPhone: string | null;
        staffRole: string | null;
        isActive: boolean;
        totalOrders: number;
        totalSales: number;
        lastOrderDate: string;
      }

      // Query to get staff list from order_master
      // Join with contact_master table to get staff details
      // Exclude deleted staff (is_deleted = 1 or true)
      // Use staffId to correctly track individual staff performance
      const staffList = await sequelize.query<StaffListResult>(
        `
        SELECT
          cm.id as staffId,
          COALESCE(cm.name, CONCAT('Staff #', cm.id)) as staffName,
          cm.email as staffEmail,
          cm.mobile as staffPhone,
          CASE
            WHEN cm.staffAccess IS NOT NULL THEN 'staff'
            ELSE NULL
          END as staffRole,
          COALESCE(cm.active, 1) as isActive,
          COUNT(om.id) as totalOrders,
          SUM(om.total) as totalSales,
          MAX(DATE(om.createdAt)) as lastOrderDate
        FROM contact_master cm
        LEFT JOIN order_master om ON cm.id = om.staffId
          AND om.companyId = :companyId
          AND om.orderStatus != 'cancelled'
        WHERE cm.companyid = :companyId
          AND (cm.is_deleted = 0 OR cm.is_deleted IS NULL)
        GROUP BY cm.id, cm.name, cm.email, cm.mobile, cm.staffAccess, cm.active
        ORDER BY totalSales DESC
      `,
        {
          replacements: { companyId: primaryBranchId },
          type: QueryTypes.SELECT,
        },
      );

      return new CommonResponseDto(
        staffList,
        true,
        'Staff list fetched successfully',
      );
    } catch (err) {
      return new CommonResponseDto(
        [],
        false,
        `Failed to fetch staff list: ${err.message}`,
      );
    }
  }

  // STAFF PERFORMANCE V2 - Get detailed performance for a specific staff member
  async getStaffPerformance(
    companyId: number,
    staffId: number,
    filter: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CommonResponseDto> {
    try {
      // Find the connection for this companyId (primaryBranchId)
      const connection = this.branchConnections.find(
        (conn) => conn.primaryBranchId === companyId,
      );

      if (!connection) {
        return new CommonResponseDto(
          {},
          false,
          `Company ${companyId} not found`,
        );
      }

      const { sequelize, primaryBranchId, name: branchName } = connection;

      // SECURITY FIX: Use secure helper method for date filtering
      let dateCondition = '';
      let calculatedStartDate = '';
      let calculatedEndDate = '';

      try {
        const dateFilter = this.buildDateCondition(filter, startDate, endDate);
        dateCondition = dateFilter.condition;
        calculatedStartDate = dateFilter.calculatedStartDate;
        calculatedEndDate = dateFilter.calculatedEndDate;
      } catch (error) {
        return new CommonResponseDto({}, false, error.message);
      }

      // Interface for query results
      interface StaffInfoResult {
        staffId: number;
        staffName: string | null;
        staffEmail: string | null;
        staffPhone: string | null;
        staffRole: string | null;
        isActive: boolean;
      }

      interface SummaryResult {
        totalOrders: number;
        totalSales: number;
        avgOrderValue: number;
        completedOrders: number;
        cancelledOrders: number;
      }

      interface DailyBreakdownResult {
        date: string;
        orders: number;
        sales: number;
      }

      interface TopProductResult {
        productId: number;
        productName: string;
        quantity: number;
        revenue: number;
      }

      // Get staff information from contact_master (staffId is contact_master.id)
      const staffInfoResults = await sequelize.query<StaffInfoResult>(
        `
        SELECT
          cm.id as staffId,
          cm.name as staffName,
          cm.email as staffEmail,
          cm.mobile as staffPhone,
          CASE
            WHEN cm.staffAccess IS NOT NULL THEN 'staff'
            ELSE NULL
          END as staffRole,
          COALESCE(cm.active, 1) as isActive
        FROM contact_master cm
        WHERE cm.id = :staffId
          AND cm.companyid = :companyId
          AND (cm.is_deleted = 0 OR cm.is_deleted IS NULL)
        LIMIT 1
      `,
        {
          replacements: { staffId, companyId: primaryBranchId },
          type: QueryTypes.SELECT,
        },
      );

      if (staffInfoResults.length === 0) {
        return new CommonResponseDto(
          {},
          false,
          `Staff ${staffId} not found in company ${companyId}`,
        );
      }

      const staffInfo = staffInfoResults[0];

      // Get summary statistics
      // Status values: 'finished' (completed), 'started' (in progress), 'pending' (new), 'cancelled'
      // Filter by staffId (individual staff member) instead of adminId (company owner)
      const summaryResults = await sequelize.query<SummaryResult>(
        `
        SELECT
          COUNT(om.id) as totalOrders,
          COALESCE(SUM(om.total), 0) as totalSales,
          COALESCE(AVG(om.total), 0) as avgOrderValue,
          COUNT(CASE
            WHEN om.orderStatus = 'finished' THEN 1
          END) as completedOrders,
          COUNT(CASE
            WHEN om.orderStatus = 'cancelled' THEN 1
          END) as cancelledOrders
        FROM order_master om
        WHERE om.staffId = :staffId
          AND om.companyId = :companyId
          ${dateCondition}
      `,
        {
          replacements: { staffId, companyId: primaryBranchId },
          type: QueryTypes.SELECT,
        },
      );

      const summary = summaryResults[0];

      // Get daily breakdown
      const dailyBreakdown = await sequelize.query<DailyBreakdownResult>(
        `
        SELECT
          DATE(om.createdAt) as date,
          COUNT(om.id) as orders,
          COALESCE(SUM(om.total), 0) as sales
        FROM order_master om
        WHERE om.staffId = :staffId
          AND om.companyId = :companyId
          AND om.orderStatus != 'cancelled'
          ${dateCondition}
        GROUP BY DATE(om.createdAt)
        ORDER BY DATE(om.createdAt) ASC
      `,
        {
          replacements: { staffId, companyId: primaryBranchId },
          type: QueryTypes.SELECT,
        },
      );

      // Get top products sold by this staff
      const topProducts = await sequelize.query<TopProductResult>(
        `
        SELECT
          oi.productId,
          pm.idescription as productName,
          SUM(oi.quantity) as quantity,
          SUM(oi.sp_price * oi.quantity) as revenue
        FROM order_items oi
        INNER JOIN order_master om ON oi.orderId = om.id
        LEFT JOIN product_master pm ON oi.productId = pm.id
        WHERE om.staffId = :staffId
          AND om.companyId = :companyId
          AND om.orderStatus != 'cancelled'
          ${dateCondition}
        GROUP BY oi.productId, pm.idescription
        ORDER BY revenue DESC
        LIMIT 10
      `,
        {
          replacements: { staffId, companyId: primaryBranchId },
          type: QueryTypes.SELECT,
        },
      );

      const response = {
        staffInfo: {
          staffId: staffInfo.staffId,
          staffName: staffInfo.staffName,
          staffEmail: staffInfo.staffEmail,
          staffPhone: staffInfo.staffPhone,
          staffRole: staffInfo.staffRole,
          isActive: Boolean(staffInfo.isActive),
          companyId: companyId,
          branchName: branchName,
        },
        dateRange: {
          startDate: calculatedStartDate,
          endDate: calculatedEndDate,
          filter: filter,
        },
        summary: {
          totalOrders: Number(summary.totalOrders) || 0,
          totalSales: Number(summary.totalSales) || 0,
          avgOrderValue: Number(summary.avgOrderValue).toFixed(2),
          completedOrders: Number(summary.completedOrders) || 0,
          cancelledOrders: Number(summary.cancelledOrders) || 0,
        },
        dailyBreakdown: dailyBreakdown.map((item) => ({
          date: item.date,
          orders: Number(item.orders) || 0,
          sales: Number(item.sales) || 0,
        })),
        topProducts: topProducts.map((item) => ({
          productId: item.productId,
          productName: item.productName || 'Unknown Product',
          quantity: Number(item.quantity) || 0,
          revenue: Number(item.revenue) || 0,
        })),
      };

      return new CommonResponseDto(
        response,
        true,
        'Staff performance fetched successfully',
      );
    } catch (err) {
      return new CommonResponseDto(
        {},
        false,
        `Failed to fetch staff performance: ${err.message}`,
      );
    }
  }

  // Get all products ordered by a specific staff member
  async getStaffProducts(
    companyId: number,
    staffId: number,
    filter: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    pageSize?: number,
    limit?: number,
  ): Promise<CommonResponseDto> {
    try {
      // Find the connection for this companyId (primaryBranchId)
      const connection = this.branchConnections.find(
        (conn) => conn.primaryBranchId === companyId,
      );

      if (!connection) {
        return new CommonResponseDto(
          {},
          false,
          `Company ${companyId} not found`,
        );
      }

      const { sequelize, primaryBranchId, name: branchName } = connection;

      // SECURITY FIX: Use secure helper method for date filtering
      let dateCondition = '';
      let calculatedStartDate = '';
      let calculatedEndDate = '';

      try {
        const dateFilter = this.buildDateCondition(filter, startDate, endDate);
        dateCondition = dateFilter.condition;
        calculatedStartDate = dateFilter.calculatedStartDate;
        calculatedEndDate = dateFilter.calculatedEndDate;
      } catch (error) {
        return new CommonResponseDto({}, false, error.message);
      }

      // Interface for staff product results
      interface StaffProductResult {
        productId: number;
        productName: string;
        barcode: string | null;
        totalQuantity: number;
        unitPrice: number;
        totalRevenue: number;
        orderCount: number;
        category: string | null;
      }

      interface ProductOrderDetail {
        orderId: number;
        orderDate: string;
        orderStatus: string;
        quantity: number;
        price: number;
        itemTotal: number;
      }

      // OPTIMIZED: Single query to get all products with their order details
      // This eliminates the N+1 query problem
      interface ProductWithOrderDetail {
        productId: number;
        productName: string;
        barcode: string | null;
        category: string | null;
        unitPrice: number;
        orderId: number;
        tokenNumber: string;
        orderDate: string;
        orderStatus: string;
        quantity: number;
        price: number;
        itemTotal: number;
      }

      const allProductOrders = await sequelize.query<ProductWithOrderDetail>(
        `
        SELECT
          oi.productId,
          COALESCE(pm.idescription, 'Unknown Product') as productName,
          pm.barcode,
          pc.category as category,
          COALESCE(pm.sp_price, oi.sp_price) as unitPrice,
          om.id as orderId,
          om.tokenNo as tokenNumber,
          DATE_FORMAT(om.createdAt, '%Y-%m-%d %H:%i:%s') as orderDate,
          om.orderStatus,
          oi.quantity,
          oi.sp_price as price,
          (oi.sp_price * oi.quantity) as itemTotal
        FROM order_items oi
        INNER JOIN order_master om ON oi.orderId = om.id
        LEFT JOIN product_master pm ON oi.productId = pm.id
        LEFT JOIN product_category pc ON pm.product_category = pc.id
        WHERE om.staffId = :staffId
          AND om.companyId = :companyId
          AND om.orderStatus != 'cancelled'
          ${dateCondition}
        ORDER BY oi.productId, om.createdAt DESC
      `,
        {
          replacements: { staffId, companyId: primaryBranchId },
          type: QueryTypes.SELECT,
        },
      );

      // Group orders by product in memory (much faster than N queries)
      const productMap = new Map<
        number,
        {
          productId: number;
          productName: string;
          barcode: string | null;
          category: string | null;
          totalQuantity: number;
          unitPrice: number;
          totalRevenue: number;
          orderCount: number;
          orders: Array<{
            orderId: number;
            tokenNumber: string;
            orderDate: string;
            orderStatus: string;
            quantity: number;
            price: number;
            itemTotal: number;
          }>;
        }
      >();

      // Process all rows and group by productId
      allProductOrders.forEach((row) => {
        const productId = row.productId;

        if (!productMap.has(productId)) {
          productMap.set(productId, {
            productId: row.productId,
            productName: row.productName,
            barcode: row.barcode,
            category: row.category,
            totalQuantity: 0,
            unitPrice: Number(row.unitPrice) || 0,
            totalRevenue: 0,
            orderCount: 0,
            orders: [],
          });
        }

        const product = productMap.get(productId)!;
        const quantity = Number(row.quantity) || 0;
        const itemTotal = Number(row.itemTotal) || 0;

        product.totalQuantity += quantity;
        product.totalRevenue += itemTotal;

        // Track unique orders for orderCount
        const orderExists = product.orders.some((o) => o.orderId === row.orderId);
        if (!orderExists) {
          product.orderCount += 1;
        }

        product.orders.push({
          orderId: row.orderId,
          tokenNumber: row.tokenNumber,
          orderDate: row.orderDate,
          orderStatus: row.orderStatus,
          quantity: quantity,
          price: Number(row.price) || 0,
          itemTotal: itemTotal,
        });
      });

      // Convert map to array and sort by revenue
      let allProducts = Array.from(productMap.values()).sort(
        (a, b) => b.totalRevenue - a.totalRevenue,
      );

      // Apply limit if specified (max 500)
      const maxLimit = 500;
      if (limit && limit > 0) {
        const appliedLimit = Math.min(limit, maxLimit);
        allProducts = allProducts.slice(0, appliedLimit);
      }

      // Calculate pagination
      const defaultPageSize = 50;
      const maxPageSize = 100;
      const appliedPageSize = pageSize
        ? Math.min(Math.max(pageSize, 1), maxPageSize)
        : defaultPageSize;
      const currentPage = page && page > 0 ? page : 1;
      const totalProducts = allProducts.length;
      const totalPages = Math.ceil(totalProducts / appliedPageSize);
      const startIndex = (currentPage - 1) * appliedPageSize;
      const endIndex = startIndex + appliedPageSize;

      // Apply pagination
      const productsWithOrders = allProducts.slice(startIndex, endIndex);

      // Get staff info for context
      interface StaffInfoResult {
        staffId: number;
        staffName: string | null;
        staffEmail: string | null;
      }

      const staffInfoResults = await sequelize.query<StaffInfoResult>(
        `
        SELECT
          cm.id as staffId,
          cm.name as staffName,
          cm.email as staffEmail
        FROM contact_master cm
        WHERE cm.id = :staffId
          AND cm.companyid = :companyId
          AND (cm.is_deleted = 0 OR cm.is_deleted IS NULL)
        LIMIT 1
      `,
        {
          replacements: { staffId, companyId: primaryBranchId },
          type: QueryTypes.SELECT,
        },
      );

      if (staffInfoResults.length === 0) {
        return new CommonResponseDto(
          {},
          false,
          `Staff ${staffId} not found in company ${companyId}`,
        );
      }

      const staffInfo = staffInfoResults[0];

      const response = {
        staffInfo: {
          staffId: staffInfo.staffId,
          staffName: staffInfo.staffName,
          staffEmail: staffInfo.staffEmail,
          companyId: companyId,
          branchName: branchName,
        },
        dateRange: {
          startDate: calculatedStartDate,
          endDate: calculatedEndDate,
          filter: filter,
        },
        pagination: {
          currentPage: currentPage,
          pageSize: appliedPageSize,
          totalProducts: totalProducts,
          totalPages: totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
        summary: {
          totalProducts: totalProducts,
          totalQuantity: allProducts.reduce(
            (sum, p) => sum + p.totalQuantity,
            0,
          ),
          totalRevenue: allProducts.reduce(
            (sum, p) => sum + p.totalRevenue,
            0,
          ),
        },
        products: productsWithOrders,
      };

      return new CommonResponseDto(
        response,
        true,
        'Staff products fetched successfully',
      );
    } catch (err) {
      return new CommonResponseDto(
        {},
        false,
        `Failed to fetch staff products: ${err.message}`,
      );
    }
  }
}
