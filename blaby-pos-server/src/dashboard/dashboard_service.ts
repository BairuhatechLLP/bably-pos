import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { Op } from "sequelize";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { SalesInvoiceService } from "../sale_invoice/sale_invoice_service";
import { PurchaseInvoiceService } from "../purchase_invoice/purchase_invoice_service";
import moment from "moment";
import { StaffTransactionsService } from "../staff_transactions/staff_transactions_service";
import sequelize from "sequelize";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { User } from "../users/user.entity";

@Injectable()
export class DashboardService {
  @Inject(SalesInvoiceService)
  private readonly sale_invoice: SalesInvoiceService;
  @Inject(PurchaseInvoiceService)
  private readonly purchase_invoice: PurchaseInvoiceService;
  @Inject(StaffTransactionsService)
  private readonly staff_transactions_service: StaffTransactionsService;

  constructor() {}

  async getCustomData(adminid, sdate, companyid) {
    let response: CommonResponseDto;
    try {
      let endDate = new Date(sdate);
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

      const totalSales = await this.sale_invoice.sum("total", {
        where: {
          adminid,
          type: "sales",
          companyid,
        },
      });

      //purchase
      const totalPurchase = await this.purchase_invoice.sum("total", {
        where: {
          adminid,
          type: "purchase",
          companyid,
        },
      });

      // current month - sale
      const cTotalSales = await this.sale_invoice.sum("total", {
        where: {
          adminid,
          type: "sales",
          companyid,
          created_at: {
            [Op.lte]: endDate,
            [Op.gte]: startDate,
          },
        },
      });

      // current month - purchase

      const cTotalPurchase = await this.purchase_invoice.sum("total", {
        where: {
          adminid,
          type: "purchase",
          companyid,
          createdat: {
            [Op.lte]: endDate,
            [Op.gte]: startDate,
          },
        },
      });

      // sales calculation
      var salesPercentageChange =
        (Number(cTotalSales) / Number(totalSales)) * 100;

      // purchase calculation
      var purchasePercentageChange =
        (Number(cTotalPurchase) / Number(totalPurchase)) * 100;

      //profit calculation
      let totalProfit = Number(totalSales) - Number(totalPurchase);
      let currentMonthProfit = Number(cTotalSales) - Number(cTotalPurchase);
      let profitPercentage =
        (Number(currentMonthProfit) / Number(totalProfit)) * 100;

      const data = {
        totalSales: Number(totalSales).toFixed(2),
        totalPurchase: Number(totalPurchase).toFixed(2),
        salesPercentageChange,
        purchasePercentageChange,
        profitPercentage,
      };

      response = {
        status: true,
        message: "Progress Data",
        data,
      };

      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getGraphData(adminid, sdate, ldate, companyid) {
    let response: CommonResponseDto;
    try {
      let startDate = new Date(sdate);
      const startOfDay = moment(startDate).startOf("day").toISOString();
      let endDate = new Date(ldate);
      const endOfDay = moment(endDate).endOf("day").toISOString();

      const timeDifference =
        new Date(startOfDay).getTime() - new Date(startOfDay).getTime();
      const interval = timeDifference / 4;

      const section1start = new Date(startOfDay);
      const section2start = new Date(section1start.getTime() + interval);
      const section3start = new Date(section2start.getTime() + interval);
      const section4start = new Date(section3start.getTime() + interval);

      //sales

      async function getTotalSales(this: DashboardService, date) {
        const totalSales = await this.sale_invoice.sum("total", {
          where: {
            adminid,
            type: "sales",
            companyid,
            created_at: {
              [Op.lte]: date,
            },
          },
        });

        return totalSales;
      }
      let sales1 = await getTotalSales.call(this, section1start);
      let sales2 = await getTotalSales.call(this, section2start);
      let sales3 = await getTotalSales.call(this, section3start);
      let sales4 = await getTotalSales.call(this, section4start);
      let sales5 = await getTotalSales.call(this, new Date(endOfDay));

      const sdatasets = [
        { label: "S1", data: Number(sales1) },
        { label: "S2", data: Number(sales2) },
        { label: "S3", data: Number(sales3) },
        { label: "S4", data: Number(sales4) },
        { label: "S5", data: Number(sales5) },
      ];

      // purchase

      async function getTotalPurchase(this: DashboardService, date) {
        const totalPurchases = await this.purchase_invoice.sum("total", {
          where: {
            adminid,
            type: "purchase",
            companyid,
            createdat: {
              [Op.lte]: date,
            },
          },
        });
        return totalPurchases;
      }

      let purchase1 = await getTotalPurchase.call(this, section1start);
      let purchase2 = await getTotalPurchase.call(this, section2start);
      let purchase3 = await getTotalPurchase.call(this, section3start);
      let purchase4 = await getTotalPurchase.call(this, section4start);
      let purchase5 = await getTotalPurchase.call(this, new Date(endOfDay));

      let pdatasets = [
        { label: "P1", data: Number(purchase1) },
        { label: "P2", data: Number(purchase2) },
        { label: "P3", data: Number(purchase3) },
        { label: "P4", data: Number(purchase4) },
        { label: "P5", data: Number(purchase5) },
      ];

      response = {
        status: true,
        message: "Graph Data",
        data: { pdatasets, sdatasets },
      };
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // staff dashboard

  async staffActivityData(staffId: number) {
    try {
      let today = new Date();
      let yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const todaystart = moment(today).startOf("day").toISOString();
      const todayEnd = moment(today).endOf("day").toISOString();

      const yesterdayStart = moment(yesterday).startOf("day").toISOString();
      const yesterdayEnd = moment(yesterday).endOf("day").toISOString();

      const totalSales = await this.sale_invoice.sum("total", {
        where: {
          createdBy: staffId,
          type: "sales",
          created_at: {
            [Op.lte]: todayEnd,
          },
        },
      });

      const totalSalesToday = await this.sale_invoice.sum("total", {
        where: {
          createdBy: staffId,
          type: "sales",
          created_at: {
            [Op.lte]: todayEnd,
            [Op.gte]: todaystart,
          },
        },
      });

      const totalSalesYesterday = await this.sale_invoice.sum("total", {
        where: {
          createdBy: staffId,
          type: "sales",
          created_at: {
            [Op.lte]: yesterdayEnd,
            [Op.gte]: yesterdayStart,
          },
        },
      });

      //purchase
      const totalPurchaseToday = await this.purchase_invoice.sum("total", {
        where: {
          createdBy: staffId,
          type: "purchase",
          createdat: {
            [Op.lte]: todayEnd,
            [Op.gte]: todaystart,
          },
        },
      });
      const totalPurchaseYesterday = await this.purchase_invoice.sum("total", {
        where: {
          createdBy: staffId,
          type: "purchase",
          createdat: {
            [Op.lte]: yesterdayEnd,
            [Op.gte]: yesterdayStart,
          },
        },
      });

      // total collection

      const totalCollectionCredit = await this.staff_transactions_service.sum(
        "paid_amount",
        {
          where: {
            staffid: staffId,
            type: {
              [Op.or]: ["Customer Receipt", "Other Receipt"],
            },
            created_at: {
              [Op.lte]: todayEnd,
            },
          },
        }
      );

      const totalCollectionDebit = await this.staff_transactions_service.sum(
        "paid_amount",
        {
          where: {
            staffid: staffId,
            type: {
              [Op.or]: ["Supplier Payment", "Other Payment"],
            },
            created_at: {
              [Op.lte]: todayEnd,
            },
          },
        }
      );

      const totalCollection =
        Number(totalCollectionCredit) - Number(totalCollectionDebit);

      const totalCollectionTodayCredit =
        await this.staff_transactions_service.sum("paid_amount", {
          where: {
            staffid: staffId,
            created_at: {
              [Op.lte]: todayEnd,
              [Op.gte]: todaystart,
            },
            type: {
              [Op.or]: ["Customer Receipt", "Other Receipt"],
            },
          },
        });
      const totalCollectionTodayDebit =
        await this.staff_transactions_service.sum("paid_amount", {
          where: {
            staffid: staffId,
            created_at: {
              [Op.lte]: todayEnd,
              [Op.gte]: todaystart,
            },
            type: {
              [Op.or]: ["Supplier Payment", "Other Payment"],
            },
          },
        });

      const totalCollectionToday =
        Number(totalCollectionTodayCredit) - Number(totalCollectionTodayDebit);

      const totalCollectionYesterdayCredit =
        await this.staff_transactions_service.sum("paid_amount", {
          where: {
            staffid: staffId,
            created_at: {
              [Op.lte]: yesterdayEnd,
              [Op.gte]: yesterdayStart,
            },
            type: {
              [Op.or]: ["Customer Receipt", "Other Receipt"],
            },
          },
        });

      const totalCollectionYesterdayDebit =
        await this.staff_transactions_service.sum("paid_amount", {
          where: {
            staffid: staffId,
            created_at: {
              [Op.lte]: yesterdayEnd,
              [Op.gte]: yesterdayStart,
            },
            type: {
              [Op.or]: ["Supplier Payment", "Other Payment"],
            },
          },
        });

      const totalCollectionYesterday =
        Number(totalCollectionYesterdayCredit) -
        Number(totalCollectionYesterdayDebit);

      // closed amount

      const totalAmountClosedCredit = await this.staff_transactions_service.sum(
        "paid_amount",
        {
          where: {
            staffid: staffId,
            status: "closed",
            created_at: {
              [Op.lte]: todayEnd,
            },
            type: {
              [Op.or]: ["Customer Receipt", "Other Receipt"],
            },
          },
        }
      );
      const totalAmountClosedDebit = await this.staff_transactions_service.sum(
        "paid_amount",
        {
          where: {
            staffid: staffId,
            status: "closed",
            created_at: {
              [Op.lte]: todayEnd,
            },
            type: {
              [Op.or]: ["Supplier Payment", "Other Payment"],
            },
          },
        }
      );

      const totalAmountClosed =
        Number(totalAmountClosedCredit) - Number(totalAmountClosedDebit);

      const totalAmountClosedYesterdayCredit =
        await this.staff_transactions_service.sum("paid_amount", {
          where: {
            staffid: staffId,
            status: "closed",
            created_at: {
              [Op.lte]: yesterdayEnd,
              [Op.gte]: yesterdayStart,
            },
            type: {
              [Op.or]: ["Customer Receipt", "Other Receipt"],
            },
          },
        });

      const totalClosedAmountYesterdayDebit =
        await this.staff_transactions_service.sum("paid_amount", {
          where: {
            staffid: staffId,
            status: "closed",
            created_at: {
              [Op.lte]: yesterdayEnd,
              [Op.gte]: yesterdayStart,
            },
            type: {
              [Op.or]: ["Supplier Payment", "Other Payment"],
            },
          },
        });

      const totalAmountClosedTodayCredit =
        await this.staff_transactions_service.sum("paid_amount", {
          where: {
            staffid: staffId,
            status: "closed",
            created_at: {
              [Op.lte]: todayEnd,
              [Op.gte]: todaystart,
            },
            type: {
              [Op.or]: ["Customer Receipt", "Other Receipt"],
            },
          },
        });

      const totalClosedAmountTodayDebit =
        await this.staff_transactions_service.sum("paid_amount", {
          where: {
            staffid: staffId,
            status: "closed",
            created_at: {
              [Op.lte]: todayEnd,
              [Op.gte]: todaystart,
            },
            type: {
              [Op.or]: ["Supplier Payment", "Other Payment"],
            },
          },
        });

      const totalClosedAmountToday =
        Number(totalAmountClosedTodayCredit) -
        Number(totalClosedAmountTodayDebit);
      const totalClosedAmountYesterday =
        Number(totalAmountClosedYesterdayCredit) -
        Number(totalClosedAmountYesterdayDebit);

      const salesPercentage = (totalSalesToday / totalSalesYesterday) * 100;
      const purchasePercentage =
        (totalPurchaseToday / totalPurchaseYesterday) * 100;

      const collectionPercentage =
        (totalCollectionToday / totalCollectionYesterday) * 100;
      const totalClosedAmountPercentage =
        (totalClosedAmountToday / totalClosedAmountYesterday) * 100;

      let data = {
        totalSales,
        salesPercentage,
        purchasePercentage,
        totalCollection,
        collectionPercentage,
        totalAmountClosed,
        totalClosedAmountPercentage,
      };

      return new CommonResponseDto(data, true, "Staff acitivity data");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUserGraphData() {
    let response: CommonResponseDto;
    try {
      let startDate = new Date("2024-01-01");
      const startOfDay = moment(startDate).startOf("day").toISOString();
      let endDate = new Date();
      const endOfDay = moment(endDate).endOf("day").toISOString();
      const timeDifference =
        new Date(startOfDay).getTime() - new Date(startOfDay).getTime();
      const interval = timeDifference / 4;
      const section1start = new Date(startOfDay);
      const section2start = new Date(section1start.getTime() + interval);
      const section3start = new Date(section2start.getTime() + interval);
      const section4start = new Date(section3start.getTime() + interval);
      //TAX GO
      async function getTotalTaxgoUsers(this: DashboardService, date) {
        const totalTaxgoUsers = await User.count({
          where: {
            isTaxgo:true,
            createdAt: {
              [Op.lte]: date,
            },
          },
        });
        return totalTaxgoUsers;
      }
      let point1 = await getTotalTaxgoUsers.call(this, section1start);
      let point2 = await getTotalTaxgoUsers.call(this, section2start);
      let point3 = await getTotalTaxgoUsers.call(this, section3start);
      let point4 = await getTotalTaxgoUsers.call(this, section4start);
      let point5 = await getTotalTaxgoUsers.call(this, new Date(endOfDay));
      const TaxgoDatasets = [
        { label: "T1", data: Number(point1) },
        { label: "T2", data: Number(point2) },
        { label: "T3", data: Number(point3) },
        { label: "T4", data: Number(point4) },
        { label: "T5", data: Number(point5) },
      ];
      // RETAIL XPRESS
      async function getTotalRetailUsers(this: DashboardService, date) {
        const totalRetailUsers = await User.count({
          where: {
            isTaxgo:false,
            createdAt: {
              [Op.lte]: date,
            },
          },
        });
        return totalRetailUsers;
      }
      let RetailPoint1 = await getTotalRetailUsers.call(this, section1start);
      let RetailPoint2 = await getTotalRetailUsers.call(this, section2start);
      let RetailPoint3 = await getTotalRetailUsers.call(this, section3start);
      let RetailPoint4 = await getTotalRetailUsers.call(this, section4start);
      let RetailPoint5 = await getTotalRetailUsers.call(
        this,
        new Date(endOfDay)
      );
      let RetailDatasets = [
        { label: "R1", data: Number(RetailPoint1) },
        { label: "R2", data: Number(RetailPoint2) },
        { label: "R3", data: Number(RetailPoint3) },
        { label: "R4", data: Number(RetailPoint4) },
        { label: "R5", data: Number(RetailPoint5) },
      ];
      const totalTaxgoUsers = await User.count({ where: { isTaxgo:true }});
      const totalRetailUsers = await User.count({ where: { isTaxgo:false }});
      response = {
        status: true,
        message: "Users Graph Data",
        data: {
          TaxgoDatasets,
          RetailDatasets,
          totalTaxgoUsers,
          totalRetailUsers,
        },
      };
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
