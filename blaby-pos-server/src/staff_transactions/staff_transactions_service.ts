import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import moment from "moment";
import { Op, Sequelize } from "sequelize";
import config from "../../config";
import { DatabaseService } from "../database/database.service";
import { PurchaseInvoiceService } from "../purchase_invoice/purchase_invoice_service";
import { SalesInvoiceService } from "../sale_invoice/sale_invoice_service";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import {
  ListStaffTrancectionDto,
  TransactionListDto,
} from "./dto/staff_transactions.list-dto";
import { StaffTransactionsDto } from "./dto/staff_transactions_dto";
import { StaffTransactions } from "./staff_transactions_entity";
import { BillingCounterService } from "../billing_counter/billing_counter_service";
import { RetailCustomerEntity } from "../retailCustomers/retail_customer_entity";

@Injectable()
export class StaffTransactionsService {
  @Inject(forwardRef(() => SalesInvoiceService))
  private readonly sale_invoice: SalesInvoiceService;

  @Inject(forwardRef(() => PurchaseInvoiceService))
  private readonly purchase_invoice: PurchaseInvoiceService;

  @Inject(forwardRef(() => BillingCounterService))
  private readonly billingCounterService: BillingCounterService;

  constructor(
    @Inject("StaffTransactionsRepository")
    private readonly StaffTransaction: typeof StaffTransactions,

    private readonly databaseService: DatabaseService
  ) {}

  async findAll() {
    try {
      const stafTransaction =
        await this.StaffTransaction.findAll<StaffTransactions>({});
      return stafTransaction.map(
        (company) => new StaffTransactionsDto(company)
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllByQuery(query) {
    try {
      const cart = await this.StaffTransaction.findAll<StaffTransactions>(
        query
      );
      return cart.map((cart) => new StaffTransactionsDto(cart));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findById(id: number) {
    try {
      const staff = await this.StaffTransaction.findByPk<StaffTransactions>(
        id,
        {}
      );
      if (!staff) {
        throw new HttpException(
          "No staff Transaction found",
          HttpStatus.NOT_FOUND
        );
      }
      return staff;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sum(field: any, query: any) {
    try {
      const data = await this.StaffTransaction.sum(field, query);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async transactionForChosenPeriod(
    adminid: number,
    staffid: number,
    sdate: any,
    ldate: any
  ) {
    try {
      let startDate = new Date(sdate);
      const startOfDay = moment(startDate).startOf("day").toISOString();
      let endDate = new Date(ldate);
      const endOfDay = moment(endDate).endOf("day").toISOString();

      let transactions = await this.findAllByQuery({
        where: {
          adminid,
          staffid,
          createdat: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
        },
        order: [["id", "DESC"]],
      });

      return new CommonResponseDto(
        transactions,
        true,
        "transaction details for chosen period"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: number, userId: number) {
    try {
      const transaction =
        await this.StaffTransaction.findOne<StaffTransactions>({
          where: {
            id,
            adminid: userId,
          },
        });
      if (!transaction) {
        throw new HttpException("No transaction found", HttpStatus.NOT_FOUND);
      }
      return new CommonResponseDto(transaction, true, "Transaction Details");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(createInvoice) {
    try {
      const stafTransaction = new StaffTransactions();
      stafTransaction.adminid = createInvoice?.adminid;
      stafTransaction.companyid = createInvoice?.companyid;
      stafTransaction.ledger = createInvoice?.ledger;
      stafTransaction.ledgercategory = createInvoice?.ledgercategory;
      stafTransaction.type = createInvoice?.type;
      stafTransaction.usertype = "staff";
      stafTransaction.paid_amount = createInvoice?.paid_amount;
      stafTransaction.total = createInvoice?.total;
      stafTransaction.outstanding = createInvoice?.outstanding;
      stafTransaction.saleid = createInvoice?.saleid;
      stafTransaction.counterid = createInvoice?.counterid;
      stafTransaction.shiftid = createInvoice?.shiftid;
      stafTransaction.purchaseid = createInvoice?.purchaseid;
      stafTransaction.journalid = createInvoice?.journalid;
      stafTransaction.invoiceno = createInvoice?.invoiceno;
      stafTransaction.saletype = createInvoice?.saletype;
      stafTransaction.paymethod = createInvoice?.paymethod;
      stafTransaction.customerid = createInvoice?.customerid;
      stafTransaction.staffid = createInvoice?.staffid;
      // stafTransaction.createdBy = createInvoice?.staffid;
      stafTransaction.status = createInvoice.status || "open";
      stafTransaction.paid_status = createInvoice?.paid_status;
      // stafTransaction.overall_parcel_charge = createInvoice?.overall_parcel_charge;
      stafTransaction.sdate = createInvoice.sdate || new Date();
      if (
        createInvoice?.type == "Customer Receipt" &&
        createInvoice?.counterid
      ) {
        const balance =
          Number(createInvoice?.total) - Number(createInvoice?.outstanding);
        await this.billingCounterService.updateBlanceInvoice(
          createInvoice?.counterid,
          balance
        );
      }
      let data = await stafTransaction.save();
      return {
        data,
        status: true,
        message: "Staff transaction created successfully",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async bulkCreate(counterId: number, type: string, createInvoice: any[]) {
    try {
      let total = 0;
      let outstanding = 0;
      const dataArray = createInvoice.map((item: any) => {
        total += Number(item.total);
        outstanding += Number(item?.outstanding);
        return {
          adminid: item.adminid,
          companyid: item?.companyid,
          ledger: item?.ledger,
          ledgercategory: item?.ledgercategory,
          type: item?.type,
          usertype: "staff",
          paid_amount: item?.paid_amount,
          total: item?.total,
          outstanding: item?.outstanding,
          saleid: item?.saleid,
          counterid: item?.counterid,
          shiftid: item?.shiftid,
          purchaseid: item?.purchaseid,
          journalid: item?.journalid,
          invoiceno: item?.invoiceno,
          saletype: item?.saletype,
          paymethod: item?.paymethod,
          customerid: item?.customerid,
          staffid: item?.staffid,
          status: item.status || "open",
          paid_status: item?.paid_status,
          sdate: item.sdate || new Date(),
        };
      });

      const data = await this.StaffTransaction.bulkCreate(dataArray);

      if (type === "Customer Receipt" && counterId) {
        const balance = Number(total) - Number(outstanding);
        await this.billingCounterService.updateBlanceInvoice(
          counterId,
          balance
        );
      }

      return {
        data,
        status: true,
        message: "Staff transaction created successfully",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async list(adminid: number, data: ListStaffTrancectionDto) {
    try {
      const page = data?.page || 1;
      const take = data?.take || 10;
      const offset = (page - 1) * take;
      var whereCase: any = {
        adminid: adminid,
        companyid: data?.companyid,
        staffid: data?.staffid,
      };
      var where: any = {};
      if (data?.type) {
        whereCase["type"] = data?.type; // type
      }

      var queryCondition = {};

      // if (data?.query) {
      //   const searchQuery = data.query.toLowerCase();
      //   const items = ["saleid", "type"].map((item) => {
      //     return Sequelize.where(
      //       Sequelize.fn("LOWER", Sequelize.col(item)),
      //       "LIKE",
      //       `%${searchQuery}%`
      //     );
      //   });
      //   queryCondition = { [Op.or]: items };
      // }

      if (data?.query) {
        const searchQuery = data.query.toLowerCase();
        const items = ["saleid", "type", "order_id"].map((item) => {
          return Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col(item)),
            "LIKE",
            `%${searchQuery}%`
          );
        });
        queryCondition = { [Op.or]: items };
      }
      if (data?.paymethod) {
        whereCase["paymethod"] = data?.paymethod;
      }
      if (data?.shiftId) {
        whereCase["shiftid"] = data?.shiftId;
      }
      if (data?.sDate && data?.lDate) {
        whereCase["sdate"] = {
          [Op.between]: [
            moment(data?.sDate).startOf("day").toDate(),
            moment(data?.lDate).endOf("day").toDate(),
          ],
        };
        where["sdate"] = {
          [Op.between]: [
            moment(data?.sDate).startOf("day").toDate(),
            moment(data?.lDate).endOf("day").toDate(),
          ],
        };
      }
      if (data?.status == "open" || data?.status == "closed") {
        whereCase["status"] = data?.status;
      }
      whereCase = { ...whereCase, ...queryCondition };
      var Total: any = await StaffTransactions.count({ where: whereCase });
      let datas = await StaffTransactions.findAll({
        where: whereCase,
        offset: offset,
        limit: take,
        order: [["id", "DESC"]],
        raw: true,
      });
      const totalCashAmount = await StaffTransactions.sum("total", {
        where: {
          ...where,
          paymethod: "Cash",
          adminid: adminid,
          companyid: data?.companyid,
          staffid: data?.staffid,
        },
      });
      const totalUpiAmount = await StaffTransactions.sum("total", {
        where: {
          ...where,
          paymethod: "Bank",
          adminid: adminid,
          companyid: data?.companyid,
          staffid: data?.staffid,
        },
      });

      const totalPages = Math.ceil(Total / take);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const meta = {
        page: page,
        take: take,
        total: Total,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        from: Total > 0 ? offset + 1 : 0,
        to: Math.min(offset + take, Total),
      };

      let success = {
        datas,
        totalCashAmount,
        totalUpiAmount,
        Total,
        meta: meta,
        status: true,
        message: "Staff  Transaction List",
      };
      return success;
    } catch (error) {
      console.log(error);
      throw error;
      // let meta = {
      //   page: data?.page,
      //   take: data?.take,
      //   total: 0
      // }
      // let error = {
      //   datas: [],
      //   Total: 0,
      //   meta: {},
      //   status: false,
      //   message: "Error Listing Staff  Transaction",
      // };
    }
  }
  async reportPageList(adminid: number, data: ListStaffTrancectionDto) {
    try {
      var whereCase: any = {
        adminid: adminid,
        companyid: data?.companyid,
        staffid: data?.staffid,
      };
      if (data?.type) {
        whereCase["type"] = data?.type; // type
      }

      if (data?.sDate) {
        whereCase["sdate"] = {
          [Op.between]: [
            moment(data?.sDate).startOf("day").toISOString(),
            moment(data?.lDate).endOf("day").toISOString(),
          ],
        };
      }
      whereCase = { ...whereCase };
      var Total: any = await StaffTransactions.count({ where: whereCase });
      let datas = await StaffTransactions.findAll({
        where: whereCase,
        order: [["id", "DESC"]],
        raw: true,
      });
      let dataCount = await this.totalInvoiceCountByDate(whereCase);
      const totalCashAmount = await StaffTransactions.sum("total", {
        where: {
          sdate: {
            [Op.between]: [
              moment(data?.sDate).startOf("day").toISOString(),
              moment(data?.lDate).endOf("day").toISOString(),
            ],
          },
          paymethod: "Cash",
          adminid: adminid,
          companyid: data?.companyid,
          staffid: data?.staffid,
        },
      });
      const totalUpiAmount = await StaffTransactions.sum("total", {
        where: {
          sdate: {
            [Op.between]: [
              moment(data?.sDate).startOf("day").toDate(),
              moment(data?.lDate).endOf("day").toDate(),
            ],
          },
          paymethod: "Bank",
          adminid: adminid,
          companyid: data?.companyid,
          staffid: data?.staffid,
        },
      });

      let success = {
        datas,
        cashAmount: totalCashAmount,
        upiAmount: totalUpiAmount,
        dataCount,
        Total,
        meta: {},
        status: true,
        message: "Staff  Transaction List",
      };
      return success;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOne(body, userId) {
    try {
      const transaction =
        await this.StaffTransaction.findOne<StaffTransactions>({
          where: {
            adminid: userId,
            id: body.id,
          },
          raw: true,
        });
      if (transaction) {
        const retailCustomer = await RetailCustomerEntity.findOne({
          where: {
            id: transaction.customerid,
          },
          attributes: ["name"],
          raw: true,
        });

        const salesDetails = await this.sale_invoice.findByCustomer(
          transaction.saleid,
          "sales"
        );
        const updatedTransaction = {
          ...transaction,
          ...(salesDetails ? salesDetails.data : {}),
          retailCustomer: retailCustomer?.name,
        };
        return new CommonResponseDto(
          updatedTransaction,
          true,
          "Transaction and sales Details"
        );
      } else {
        return new CommonResponseDto({}, false, "No transaction found");
      }
    } catch (error) {
      console.error("Error occurred:", error);
      throw error;
    }
  }
  async getOnePurchase(body, userId) {
    try {
      const transaction =
        await this.StaffTransaction.findOne<StaffTransactions>({
          where: {
            adminid: userId,
            id: body.id,
          },
          raw: true,
        });
      if (transaction) {
        const salesDetails = await this.purchase_invoice.findBySupplier(
          transaction.purchaseid,
          "purchase"
        );
        const updatedTransaction = {
          ...transaction,
          ...(salesDetails ? salesDetails.data : {}),
        };
        return new CommonResponseDto(
          updatedTransaction,
          true,
          "Transaction and sales Details"
        );
      } else {
        return new CommonResponseDto({}, false, "No transaction found");
      }
    } catch (error) {
      console.error("Error occurred:", error);
      throw error;
    }
  }

  async pymentCreateToLedeger(dto) {
    try {
      let responce = {};
      let data: any = [];
      for (const transaction of dto.staffTransactions) {
        const staff = await this.findById(transaction.id);
        staff.status = "closed";
        let invoice: any = await staff.save();
        let newData: any;
        if (transaction.type === "Customer Receipt") {
          newData = await this.sale_invoice.staffCustomerReceipt(transaction, {
            bankid: dto.bankid,
            paidmethod: dto.paidmethod,
          });
        } else if (transaction.type === "Supplier Payment") {
          newData = await this.purchase_invoice.staffSupplierPayment(
            transaction,
            { bankid: dto.bankid, paidmethod: dto.paidmethod }
          );
        } else if (transaction.type === "Other Receipt") {
          newData = await this.sale_invoice.addStaffOtherReceipt(transaction, {
            bankid: dto.bankid,
            paidmethod: dto.paidmethod,
          });
        } else if (transaction.type === "Other Payment") {
          newData = await this.purchase_invoice.addStaffOtherPayment(
            transaction,
            { bankid: dto.bankid, paidmethod: dto.paidmethod }
          );
        }
        if (newData.status) {
          data.push(newData.data);
        }
      }
      if (data.length) {
        responce = {
          data: data,
          status: true,
          message: "succsess",
        };
      }
      return responce;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id, userId, updateDto) {
    try {
      const stafTransaction =
        await this.StaffTransaction.findByPk<StaffTransactions>(id);
      if (!stafTransaction) {
        return {
          data: {},
          status: false,
          message: "not staff transaction found",
        };
      }
      stafTransaction.adminid = updateDto?.adminid || stafTransaction.adminid;
      stafTransaction.ledger = updateDto?.ledger || stafTransaction.ledger;
      stafTransaction.ledgercategory =
        updateDto?.ledgercategory || stafTransaction.ledgercategory;
      stafTransaction.type = updateDto?.type || stafTransaction.type;
      stafTransaction.paid_amount =
        updateDto?.paid_amount || stafTransaction.paid_amount;
      stafTransaction.total = updateDto?.total || stafTransaction.total;
      stafTransaction.outstanding =
        updateDto?.outstanding || stafTransaction.outstanding;
      stafTransaction.saleid = updateDto?.saleid || stafTransaction.saleid;
      stafTransaction.counterid =
        updateDto?.counterid || stafTransaction.counterid;
      stafTransaction.shiftid = updateDto?.shiftid || stafTransaction.shiftid;
      stafTransaction.purchaseid =
        updateDto?.purchaseid || stafTransaction.purchaseid;
      stafTransaction.journalid =
        updateDto?.journalid || stafTransaction.journalid;
      stafTransaction.invoiceno =
        updateDto?.invoiceno || stafTransaction.invoiceno;
      stafTransaction.customerid =
        updateDto?.customerid || stafTransaction.customerid;
      stafTransaction.staffid = updateDto?.staffid || stafTransaction.staffid;
      stafTransaction.companyid =
        updateDto?.companyid || stafTransaction.companyid;
      stafTransaction.status = updateDto?.status || stafTransaction.status;
      stafTransaction.paid_status =
        updateDto?.paid_status || stafTransaction.paid_status;
      let data = stafTransaction.save();
      return { data, status: true, message: "Updated Successfully" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async listShiftData(Dto: any) {
    try {
      let list: any = await this.findAllByQuery({
        where: {
          adminid: Dto?.adminid,
          companyid: Dto?.companyid,
          shiftid: Dto?.shiftid,
          staffid: Dto?.staffid,
          type: "Customer Receipt",
        },
        order: [["id", "DESC"]],
      });

      let overAllTotal = 0;
      if (list.length) {
        list.forEach((element: any) => {
          overAllTotal += Number(Math.abs(element.total));
        });
      }
      return {
        saleCount: list.length || 0,
        saleTotal: overAllTotal.toFixed(2),
      };
    } catch (error) {
      console.log(error);
      throw error;
      // return {
      //   saleCount: 0,
      //   saleTotal: 0
      // };
    }
  }

  async totalInvoiceCount(Dto: any) {
    try {
      const query = `
        SELECT 
          COUNT(CASE WHEN type = 'Customer Receipt' THEN 1 ELSE NULL END) AS sale_row_count,
          COUNT(CASE WHEN type = 'Supplier Payment' THEN 1 ELSE NULL END) AS purchase_row_count,
          COUNT(CASE WHEN type = 'Customer Receipt' AND status = 'open' THEN 1 ELSE NULL END) AS sale_open_count
        FROM \`${config.database.database}\`.staff_transactions 
        WHERE adminid = :adminid 
          AND companyid = :companyid 
          AND staffid = :staffid;
      `;

      const replacements = {
        adminid: Dto?.adminid,
        companyid: Dto?.companyid,
        staffid: Dto?.staffid,
      };

      const [result] = await this.databaseService.getSequelize.query(query, {
        replacements,
        type: this.databaseService.getSequelize.QueryTypes.SELECT,
      });

      return {
        total_sales: result.sale_row_count,
        open_invoices: result.sale_open_count,
        closed_invoices: result.sale_row_count - result.sale_open_count,
        total_purchases: result.purchase_row_count,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async totalInvoiceCountByDate(Dto: any) {
    try {
      const { adminid, companyid, staffid, sdate } = Dto;
      console.log("sdate", sdate);
      const result: any = await this.StaffTransaction.findOne({
        attributes: [
          [
            Sequelize.literal(
              `COUNT(CASE WHEN type = 'Customer Receipt' THEN 1 ELSE NULL END)`
            ),
            "sale_row_count",
          ],
          [
            Sequelize.literal(
              `COUNT(CASE WHEN type = 'Supplier Payment' THEN 1 ELSE NULL END)`
            ),
            "purchase_row_count",
          ],
          [
            Sequelize.literal(
              `COUNT(CASE WHEN type = 'Customer Receipt' AND status = 'open' THEN 1 ELSE NULL END)`
            ),
            "sale_open_count",
          ],
        ],
        where: {
          adminid,
          companyid,
          staffid,
          sdate: sdate,
        },
        raw: true,
      });
      console.log("result", result);
      return {
        total_sales: parseInt(result.sale_row_count, 10) || 0,
        open_invoices: parseInt(result.sale_open_count, 10) || 0,
        closed_invoices:
          (parseInt(result.sale_row_count, 10) || 0) -
          (parseInt(result.sale_open_count, 10) || 0),
        total_purchases: parseInt(result.purchase_row_count, 10) || 0,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async listByShift(adminId: number, Dto: any) {
    let meta = {
      page: Dto?.page,
      take: Dto?.take,
      total: 0,
    };
    try {
      let whereCase: any = {
        adminid: adminId,
        companyid: Dto?.companyid,
        shiftid: Dto?.shiftid,
        staffid: Dto?.staffid,
      };
      let saleRate: any;
      if (Dto?.type) {
        whereCase["type"] = Dto?.type; // type
        const query = `
        SELECT 
            SUM(CASE WHEN total IS NOT NULL THEN total ELSE 0 END) AS total_sale_rate
        FROM \`${config.database.database}\`.staff_transactions 
        WHERE shiftid = ${Dto.shiftid} 
            AND adminid = ${adminId} 
            AND companyid = ${Dto.companyid} 
            AND staffid = ${Dto.staffid}
            AND type = '${Dto?.type}'
        ;
    `;
        const saleRateResult = await this.databaseService.getSequelize.query(
          query
        );
        saleRate = saleRateResult[0][0].total_sale_rate;
      }

      var Total: any = await StaffTransactions.count({ where: whereCase });
      let data = await StaffTransactions.findAll({
        where: whereCase,
        offset: (Dto?.page - 1) * Dto?.take,
        limit: Dto?.take,
        order: [["id", "DESC"]],
        raw: true,
      });

      meta.total = Total;
      return {
        data: data,
        total_invoice: Total,
        total_rate: saleRate || 0,
        meta,
        status: true,
        message: "shift by trancection list",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async shiftReportProduct(
    companyid: number,
    shiftid: number,
    staffid: number
  ) {
    try {
      let data = await StaffTransactions.findAll({
        where: {
          companyid: companyid,
          shiftid: shiftid,
          staffid: staffid,
        },
        order: [["id", "DESC"]],
        raw: true,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async shiftReport(userId: number, Dto: any) {
    try {
      const query = `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'Customer Receipt' THEN total ELSE 0 END), 0) AS total_sale_rate,
        COUNT(CASE WHEN type = 'Customer Receipt' THEN 1 ELSE NULL END) AS sale_row_count,
        COUNT(CASE WHEN type = 'Customer Receipt' AND status = 'open' THEN 1 ELSE NULL END) AS sale_open_count,
        COALESCE(SUM(CASE WHEN type = 'Customer Receipt' AND status = 'open' THEN total ELSE 0 END), 0) AS total_sale_open_rate,
        COALESCE(SUM(CASE WHEN type = 'Customer Receipt' AND status = 'closed' THEN total ELSE 0 END), 0) AS total_sale_closed_rate,
        COALESCE(SUM(CASE WHEN type = 'Supplier Payment' THEN total ELSE 0 END), 0) AS total_purchase_rate,
        COUNT(CASE WHEN type = 'Supplier Payment' THEN 1 ELSE NULL END) AS purchase_row_count,
        COALESCE(SUM(CASE WHEN type = 'Customer Receipt' AND paymethod = 'Cash' THEN paid_amount ELSE 0 END), 0) AS total_cash_received,
        COALESCE(SUM(CASE WHEN type = 'Customer Receipt' AND paymethod = 'Bank' THEN paid_amount ELSE 0 END), 0) AS total_bank_received,
        (SELECT balance FROM \`${process.env.DATABASE_NAME}\`.counter_details WHERE id = :shiftid) AS balance
      FROM \`${process.env.DATABASE_NAME}\`.staff_transactions
      WHERE shiftid = :shiftid
        AND adminid = :adminid
        AND companyid = :companyid
        AND staffid = :staffid;
    `;
      const listQuery = `
      SELECT *
      FROM \`${process.env.DATABASE_NAME}\`.staff_transactions
      WHERE type = 'Customer Receipt'
        AND status = 'open'
        AND adminid = :adminid
        AND companyid = :companyid
        AND shiftid = :shiftid
        AND staffid = :staffid;
    `;
      const replacements = {
        shiftid: Dto.shiftid,
        adminid: userId,
        companyid: Dto.companyid,
        staffid: Dto.staffid,
      };
      const [result] = await this.databaseService.getSequelize.query(query, {
        replacements,
        type: this.databaseService.getSequelize.QueryTypes.SELECT,
      });
      const openInvoicesList: any =
        await this.databaseService.getSequelize.query(listQuery, {
          replacements,
          type: this.databaseService.getSequelize.QueryTypes.SELECT,
        });
      return {
        data: {
          total_sale_rate: Number(result.total_sale_rate),
          total_sale_open_rate: Number(result?.total_sale_open_rate),
          total_sale_closed_rate: Number(result?.total_sale_closed_rate),
          sale_row_count: Number(result?.sale_row_count),
          open_invoices: Number(result?.sale_open_count),
          closed_invoice:
            Number(result?.sale_row_count) - Number(result?.sale_open_count),
          total_purchase_rate: Number(result?.total_purchase_rate),
          purchase_row_count: Number(result?.purchase_row_count),
          balance: Number(result?.balance),
          total_cash_received: Number(result?.total_cash_received),
          total_bank_received: Number(result?.total_bank_received),
          open_invoice_list: openInvoicesList,
        },
        status: true,
        message: "shift report data",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async dayReport(userId: number, Dto: any) {
    try {
      let whereCase = {
        adminid: userId,
        companyid: Dto.companyid,
        staffid: Dto.staffid,
        created_at: {
          [Op.between]: [Dto?.from, Dto?.to],
        },
        type: {
          [Op.in]: ["Supplier Payment", "Customer Receipt"],
        },
      };
      var Total: any = await StaffTransactions.count({ where: whereCase });
      let data = await StaffTransactions.findAll({
        where: whereCase,
        order: [["id", "DESC"]],
        raw: true,
      });

      return {
        data,
        total: Total,
        status: true,
        message: "Day report",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getCompleteTransactionList(adminId: number, query: TransactionListDto) {
    try {
      const {
        sdate,
        edate,
        companyId,
        staffId,
        period,
        transactiontype,
        page = 1,
        take = 10,
      } = query;

      const where: any = {
        companyid: companyId,
        staffid: staffId,
      };

      if (transactiontype) {
        if (transactiontype != "all") {
          where["paymethod"] = transactiontype;
        }
      }

      if (period) {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (period.toLowerCase()) {
          case "today":
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;

          case "yesterday":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setDate(now.getDate() - 1);
            endDate.setHours(23, 59, 59, 999);
            break;

          case "week":
            const currentDay = now.getDay();
            startDate = new Date(now);
            startDate.setDate(now.getDate() - currentDay);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;

          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            break;

          default:
            break;
        }

        if (startDate && endDate) {
          where["sdate"] = {
            [Op.between]: [startDate, endDate],
          };
        }
      }
      else if (sdate && edate) {
        const startDate = new Date(sdate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(edate);
        endDate.setHours(23, 59, 59, 999);

        where["sdate"] = {
          [Op.between]: [startDate, endDate],
        };

        if (period) {
          console.log("Period filtering:");
          console.log("Period:", period);
          console.log("Start Date:", startDate);
          console.log("End Date:", endDate);
          console.log("Date filter applied:", where["sdate"]);
        } else if (sdate && edate) {
          console.log("Custom date range filtering:");
          console.log("Original sdate:", sdate);
          console.log("Original edate:", edate);
          console.log("Processed startDate:", startDate);
          console.log("Processed endDate:", endDate);
          console.log("Date filter applied:", where["sdate"]);
        }
      }

      const offset = (page - 1) * take;

      const [totalCount, totalSum] = await Promise.all([
        this.StaffTransaction.count({ where }),
        this.StaffTransaction.sum("paid_amount", { where }),
      ]);

      const transactions = await this.StaffTransaction.findAll({
        where,
        limit: take,
        offset,
        order: [["sdate", "DESC"]], 
      });

      const totalPages = Math.ceil(totalCount / take);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return new CommonResponseDto(
        {
          transactions,
          meta: {
            currentPage: page,
            totalPages,
            totalCount,
            take,
            hasNextPage,
            hasPreviousPage,
          },
          summary: {
            totalTransactions: totalCount,
            totalAmount: totalSum || 0,
          },
        },
        true,
        "successfully fetched"
      );
    } catch (error: any) {
      console.error("Error fetching transaction list:", error);
      throw error;
    }
  }
}
