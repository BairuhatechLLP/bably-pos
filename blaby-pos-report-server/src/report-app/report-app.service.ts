import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { BranchConfig } from '../config/database.config';

@Injectable()
export class ReportAppService {
  constructor(
    @Inject('BRANCH_DATA_SOURCES')
    private readonly dataSources: DataSource[],
    @Inject('BRANCH_CONFIGS')
    private readonly branchConfigs: BranchConfig[],
  ) {}

  // Helper method to execute query on all branches
  private async queryAllBranches<T>(
    queryFn: (dataSource: DataSource, branchId: number) => Promise<T[]>,
  ): Promise<{ branchId: number; branchName: string; data: T[] }[]> {
    const results: { branchId: number; branchName: string; data: T[] }[] = [];

    for (let i = 0; i < this.dataSources.length; i++) {
      try {
        const data = await queryFn(
          this.dataSources[i],
          this.branchConfigs[i].id,
        );
        results.push({
          branchId: this.branchConfigs[i].id,
          branchName: this.branchConfigs[i].name,
          data,
        });
      } catch (error) {
        // Error querying branch - skip
        results.push({
          branchId: this.branchConfigs[i].id,
          branchName: this.branchConfigs[i].name,
          data: [],
        });
      }
    }

    return results;
  }

  // GET /report_app/v2/home - Dashboard home data (OPTIMIZED: Parallel execution)
  async getHomeData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisYearStart = new Date(today.getFullYear(), 0, 1);

    // Execute queries for all branches in parallel for maximum speed
    const branchPromises = this.dataSources.map(async (dataSource, i) => {
      const orderRepo = dataSource.getRepository(Order);

      try {
        // Execute all queries for this branch in parallel
        const [todayOrders, monthOrders, yearOrders, allOrdersCount] =
          await Promise.all([
            orderRepo
              .createQueryBuilder('order')
              .where('order.created_at >= :today', { today })
              .andWhere("order.status != 'cancelled'")
              .getMany(),

            orderRepo
              .createQueryBuilder('order')
              .where('order.created_at >= :monthStart', {
                monthStart: thisMonthStart,
              })
              .andWhere("order.status != 'cancelled'")
              .getMany(),

            orderRepo
              .createQueryBuilder('order')
              .where('order.created_at >= :yearStart', {
                yearStart: thisYearStart,
              })
              .andWhere("order.status != 'cancelled'")
              .getMany(),

            orderRepo.count(),
          ]);

        const todaySales = todayOrders.reduce(
          (sum, order) => sum + Number(order.grand_total),
          0,
        );
        const monthSales = monthOrders.reduce(
          (sum, order) => sum + Number(order.grand_total),
          0,
        );
        const yearSales = yearOrders.reduce(
          (sum, order) => sum + Number(order.grand_total),
          0,
        );

        return {
          branchId: this.branchConfigs[i].id,
          branchName: this.branchConfigs[i].name,
          todaySales,
          monthSales,
          yearSales,
          todayOrders: todayOrders.length,
          totalOrders: allOrdersCount,
        };
      } catch (error) {
        // Error fetching data - skip
        return {
          branchId: this.branchConfigs[i].id,
          branchName: this.branchConfigs[i].name,
          todaySales: 0,
          monthSales: 0,
          yearSales: 0,
          todayOrders: 0,
          totalOrders: 0,
        };
      }
    });

    // Wait for all branches to complete in parallel
    const branchSummary = await Promise.all(branchPromises);

    // Aggregate totals
    const summary = branchSummary.reduce(
      (acc, branch) => ({
        totalSalesToday: acc.totalSalesToday + branch.todaySales,
        totalSalesThisMonth: acc.totalSalesThisMonth + branch.monthSales,
        totalSalesThisYear: acc.totalSalesThisYear + branch.yearSales,
        totalOrders: acc.totalOrders + branch.totalOrders,
        totalOrdersToday: acc.totalOrdersToday + branch.todayOrders,
      }),
      {
        totalSalesToday: 0,
        totalSalesThisMonth: 0,
        totalSalesThisYear: 0,
        totalOrders: 0,
        totalOrdersToday: 0,
      },
    );

    return {
      success: true,
      data: {
        summary,
        branches: branchSummary,
      },
    };
  }

  // GET /report_app/v2/reports - Get various report types
  async getReports(reportType?: string, startDate?: string, endDate?: string) {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    switch (reportType) {
      case 'monthly':
        return this.getMonthlySalesReport(start, end);
      case 'yearly':
        return this.getYearlySalesReport();
      case 'popular_items':
        return this.getPopularItemsReport(start, end);
      case 'branch_comparison':
        return this.getBranchComparisonReport(start, end);
      default:
        return this.getAllReports(start, end);
    }
  }

  private async getMonthlySalesReport(startDate: Date, endDate: Date) {
    const monthlyData = {};

    // Fetch data from all branches in parallel
    const branchPromises = this.dataSources.map(async (dataSource, i) => {
      const orderRepo = dataSource.getRepository(Order);

      try {
        const orders = await orderRepo
          .createQueryBuilder('order')
          .where('order.created_at >= :start', { start: startDate })
          .andWhere('order.created_at <= :end', { end: endDate })
          .andWhere("order.status != 'cancelled'")
          .getMany();

        return { orders, branchName: this.branchConfigs[i].name };
      } catch (error) {
        // Error in monthly report - skip
        return { orders: [], branchName: this.branchConfigs[i].name };
      }
    });

    const branchResults = await Promise.all(branchPromises);

    // Process all orders
    branchResults.forEach(({ orders, branchName }) => {
      orders.forEach((order) => {
        const monthKey = `${order.created_at.getFullYear()}-${String(order.created_at.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            totalSales: 0,
            orderCount: 0,
            branches: {},
          };
        }
        monthlyData[monthKey].totalSales += Number(order.grand_total);
        monthlyData[monthKey].orderCount += 1;

        if (!monthlyData[monthKey].branches[branchName]) {
          monthlyData[monthKey].branches[branchName] = { sales: 0, orders: 0 };
        }
        monthlyData[monthKey].branches[branchName].sales += Number(
          order.grand_total,
        );
        monthlyData[monthKey].branches[branchName].orders += 1;
      });
    });

    return {
      success: true,
      reportType: 'monthly',
      data: Object.values(monthlyData).sort((a: any, b: any) =>
        b.month.localeCompare(a.month),
      ),
    };
  }

  private async getYearlySalesReport() {
    const yearlyData = {};

    // Fetch data from all branches in parallel
    const branchPromises = this.dataSources.map(async (dataSource, i) => {
      const orderRepo = dataSource.getRepository(Order);

      try {
        const orders = await orderRepo
          .createQueryBuilder('order')
          .where("order.status != 'cancelled'")
          .getMany();

        return { orders, branchName: this.branchConfigs[i].name };
      } catch (error) {
        // Error in yearly report - skip
        return { orders: [], branchName: this.branchConfigs[i].name };
      }
    });

    const branchResults = await Promise.all(branchPromises);

    // Process all orders
    branchResults.forEach(({ orders, branchName }) => {
      orders.forEach((order) => {
        const year = order.created_at.getFullYear();
        if (!yearlyData[year]) {
          yearlyData[year] = {
            year,
            totalSales: 0,
            orderCount: 0,
            branches: {},
          };
        }
        yearlyData[year].totalSales += Number(order.grand_total);
        yearlyData[year].orderCount += 1;

        if (!yearlyData[year].branches[branchName]) {
          yearlyData[year].branches[branchName] = { sales: 0, orders: 0 };
        }
        yearlyData[year].branches[branchName].sales += Number(
          order.grand_total,
        );
        yearlyData[year].branches[branchName].orders += 1;
      });
    });

    return {
      success: true,
      reportType: 'yearly',
      data: Object.values(yearlyData).sort((a: any, b: any) => b.year - a.year),
    };
  }

  private async getPopularItemsReport(startDate: Date, endDate: Date) {
    const itemsData = {};

    // Fetch data from all branches in parallel
    const branchPromises = this.dataSources.map(async (dataSource, i) => {
      const orderItemRepo = dataSource.getRepository(OrderItem);

      try {
        const items = await orderItemRepo
          .createQueryBuilder('item')
          .leftJoin('orders', 'order', 'order.id = item.order_id')
          .where('order.created_at >= :start', { start: startDate })
          .andWhere('order.created_at <= :end', { end: endDate })
          .andWhere("order.status != 'cancelled'")
          .getMany();

        return items;
      } catch (error) {
        // Error in popular items report - skip
        return [];
      }
    });

    const allItemsArrays = await Promise.all(branchPromises);
    const allItems = allItemsArrays.flat();

    // Process all items
    allItems.forEach((item) => {
      const key = `${item.product_id}_${item.product_name}`;
      if (!itemsData[key]) {
        itemsData[key] = {
          productId: item.product_id,
          productName: item.product_name,
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0,
        };
      }
      itemsData[key].totalQuantity += item.quantity;
      itemsData[key].totalRevenue += Number(item.subtotal);
      itemsData[key].orderCount += 1;
    });

    const sortedItems = Object.values(itemsData).sort(
      (a: any, b: any) => b.totalQuantity - a.totalQuantity,
    );

    return {
      success: true,
      reportType: 'popular_items',
      data: sortedItems.slice(0, 50), // Top 50 items
    };
  }

  private async getBranchComparisonReport(startDate: Date, endDate: Date) {
    // Fetch data from all branches in parallel
    const branchPromises = this.dataSources.map(async (dataSource, i) => {
      const orderRepo = dataSource.getRepository(Order);

      try {
        const orders = await orderRepo
          .createQueryBuilder('order')
          .where('order.created_at >= :start', { start: startDate })
          .andWhere('order.created_at <= :end', { end: endDate })
          .andWhere("order.status != 'cancelled'")
          .getMany();

        const totalSales = orders.reduce(
          (sum, order) => sum + Number(order.grand_total),
          0,
        );
        const averageOrderValue =
          orders.length > 0 ? totalSales / orders.length : 0;

        return {
          branchId: this.branchConfigs[i].id,
          branchName: this.branchConfigs[i].name,
          totalSales,
          orderCount: orders.length,
          averageOrderValue,
        };
      } catch (error) {
        // Error in branch comparison - skip
        return {
          branchId: this.branchConfigs[i].id,
          branchName: this.branchConfigs[i].name,
          totalSales: 0,
          orderCount: 0,
          averageOrderValue: 0,
        };
      }
    });

    const branchData = await Promise.all(branchPromises);

    return {
      success: true,
      reportType: 'branch_comparison',
      data: branchData.sort((a, b) => b.totalSales - a.totalSales),
    };
  }

  private async getAllReports(startDate: Date, endDate: Date) {
    const [monthly, yearly, popularItems, branchComparison] = await Promise.all(
      [
        this.getMonthlySalesReport(startDate, endDate),
        this.getYearlySalesReport(),
        this.getPopularItemsReport(startDate, endDate),
        this.getBranchComparisonReport(startDate, endDate),
      ],
    );

    return {
      success: true,
      data: {
        monthly: monthly.data,
        yearly: yearly.data,
        popularItems: popularItems.data,
        branchComparison: branchComparison.data,
      },
    };
  }

  // GET /report_app/v2/branch_picker - Get all branches for picker
  async getBranchPicker() {
    return {
      success: true,
      data: this.branchConfigs.map((config) => ({
        id: config.id,
        name: config.name,
      })),
    };
  }

  // GET /report_app/v2/branch - Get all branches with details (OPTIMIZED: Parallel execution)
  async getBranches() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Execute all branch queries in parallel
    const branchPromises = this.dataSources.map(async (dataSource, i) => {
      const orderRepo = dataSource.getRepository(Order);
      const productRepo = dataSource.getRepository(Product);

      try {
        // Execute all queries for this branch in parallel
        const [totalOrders, totalProducts, todayOrders] = await Promise.all([
          orderRepo.count(),
          productRepo.count(),
          orderRepo
            .createQueryBuilder('order')
            .where('order.created_at >= :today', { today: todayStart })
            .andWhere("order.status != 'cancelled'")
            .getMany(),
        ]);

        const todaySales = todayOrders.reduce(
          (sum, order) => sum + Number(order.grand_total),
          0,
        );

        return {
          id: this.branchConfigs[i].id,
          name: this.branchConfigs[i].name,
          totalOrders,
          totalProducts,
          todaySales,
          todayOrders: todayOrders.length,
        };
      } catch (error) {
        // Error fetching branch details - skip
        return {
          id: this.branchConfigs[i].id,
          name: this.branchConfigs[i].name,
          totalOrders: 0,
          totalProducts: 0,
          todaySales: 0,
          todayOrders: 0,
          error: error.message,
        };
      }
    });

    const branchesWithStats = await Promise.all(branchPromises);

    return {
      success: true,
      data: branchesWithStats,
    };
  }

  // GET /report_app/v2/branch_details/:id - Get specific branch details
  async getBranchDetails(branchId: number) {
    const branchIndex = this.branchConfigs.findIndex(
      (config) => config.id === branchId,
    );

    if (branchIndex === -1) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const dataSource = this.dataSources[branchIndex];
    const branchConfig = this.branchConfigs[branchIndex];
    const orderRepo = dataSource.getRepository(Order);
    const productRepo = dataSource.getRepository(Product);
    const orderItemRepo = dataSource.getRepository(OrderItem);

    try {
      // Get various statistics
      const totalOrders = await orderRepo.count();
      const totalProducts = await productRepo.count();

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const thisMonthStart = new Date(
        todayStart.getFullYear(),
        todayStart.getMonth(),
        1,
      );

      const [todayOrders, monthOrders, recentOrders, topProducts] =
        await Promise.all([
          orderRepo
            .createQueryBuilder('order')
            .where('order.created_at >= :today', { today: todayStart })
            .andWhere("order.status != 'cancelled'")
            .getMany(),

          orderRepo
            .createQueryBuilder('order')
            .where('order.created_at >= :monthStart', {
              monthStart: thisMonthStart,
            })
            .andWhere("order.status != 'cancelled'")
            .getMany(),

          orderRepo
            .createQueryBuilder('order')
            .orderBy('order.created_at', 'DESC')
            .limit(10)
            .getMany(),

          orderItemRepo
            .createQueryBuilder('item')
            .select('item.product_id', 'productId')
            .addSelect('item.product_name', 'productName')
            .addSelect('SUM(item.quantity)', 'totalQuantity')
            .addSelect('SUM(item.subtotal)', 'totalRevenue')
            .groupBy('item.product_id')
            .addGroupBy('item.product_name')
            .orderBy('totalQuantity', 'DESC')
            .limit(10)
            .getRawMany(),
        ]);

      const todaySales = todayOrders.reduce(
        (sum, order) => sum + Number(order.grand_total),
        0,
      );
      const monthSales = monthOrders.reduce(
        (sum, order) => sum + Number(order.grand_total),
        0,
      );

      return {
        success: true,
        data: {
          branch: {
            id: branchConfig.id,
            name: branchConfig.name,
          },
          statistics: {
            totalOrders,
            totalProducts,
            todaySales,
            todayOrders: todayOrders.length,
            monthSales,
            monthOrders: monthOrders.length,
          },
          recentOrders,
          topProducts,
        },
      };
    } catch (error) {
      throw new Error(`Error fetching branch details: ${error.message}`);
    }
  }

  // GET /report_app/v2/products - Get all products from all branches (OPTIMIZED: Parallel execution)
  async getProducts(branchId?: number) {
    if (branchId) {
      // Get products from specific branch
      const branchIndex = this.branchConfigs.findIndex(
        (config) => config.id === branchId,
      );
      if (branchIndex === -1) {
        throw new NotFoundException(`Branch with ID ${branchId} not found`);
      }

      const dataSource = this.dataSources[branchIndex];
      const productRepo = dataSource.getRepository(Product);
      const products = await productRepo.find({ where: { is_active: true } });

      return {
        success: true,
        data: products.map((product) => ({
          ...product,
          branchId: this.branchConfigs[branchIndex].id,
          branchName: this.branchConfigs[branchIndex].name,
        })),
      };
    }

    // Get products from all branches in parallel
    const productPromises = this.dataSources.map(async (dataSource, i) => {
      const productRepo = dataSource.getRepository(Product);

      try {
        const products = await productRepo.find({ where: { is_active: true } });
        return products.map((product) => ({
          ...product,
          branchId: this.branchConfigs[i].id,
          branchName: this.branchConfigs[i].name,
        }));
      } catch (error) {
        // Error fetching products - skip
        return [];
      }
    });

    const allProductsArrays = await Promise.all(productPromises);
    const allProducts = allProductsArrays.flat(); // Flatten the array of arrays

    return {
      success: true,
      data: allProducts,
    };
  }

  // GET /report_app/v2/product_details/:id - Get product details
  async getProductDetails(productId: number, branchId?: number) {
    const productData: any[] = [];

    const branches = branchId
      ? [this.branchConfigs.findIndex((config) => config.id === branchId)]
      : Array.from({ length: this.dataSources.length }, (_, i) => i);

    for (const branchIndex of branches) {
      if (branchIndex === -1) continue;

      const dataSource = this.dataSources[branchIndex];
      const productRepo = dataSource.getRepository(Product);
      const orderItemRepo = dataSource.getRepository(OrderItem);

      try {
        const product = await productRepo.findOne({ where: { id: productId } });

        if (product) {
          // Get sales statistics for this product
          const salesStats = await orderItemRepo
            .createQueryBuilder('item')
            .select('SUM(item.quantity)', 'totalQuantity')
            .addSelect('SUM(item.subtotal)', 'totalRevenue')
            .addSelect('COUNT(DISTINCT item.order_id)', 'orderCount')
            .where('item.product_id = :productId', { productId })
            .getRawOne();

          productData.push({
            ...product,
            branchId: this.branchConfigs[branchIndex].id,
            branchName: this.branchConfigs[branchIndex].name,
            salesStats: {
              totalQuantitySold: parseInt(salesStats.totalQuantity) || 0,
              totalRevenue: parseFloat(salesStats.totalRevenue) || 0,
              orderCount: parseInt(salesStats.orderCount) || 0,
            },
          });
        }
      } catch (error) {
        // Error fetching product - skip
      }
    }

    if (productData.length === 0) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return {
      success: true,
      data: branchId ? productData[0] : productData,
    };
  }
}
