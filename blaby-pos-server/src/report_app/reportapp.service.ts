import { Injectable } from "@nestjs/common";
import { col, fn, literal, Op } from "sequelize";
import moment from "moment";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { OrderMaster } from "../order_master/order_master.entity";
import { CompanyMaster } from "../company_master/company_master_entity";

import { OrderItems } from "../order_items/order_items.entity";
import { ProductMaster } from "../product_master/product_master";
import { ProductCategory } from "../product_category/product_category_entity";
import { ReportQueryDto } from "./dto/query.dto";

@Injectable()
export class ReportAppService {
  async formatDate(date: any) {
    const format = `YYYY-MM-DD HH:mm:ss`;
    const formated = moment(date || new Date(), format)
      .utcOffset(0, true)
      .toDate();
    return formated;
  }

  async Home(pageOpt: any) {
    return new Promise(async (resolve, reject) => {
      const date = new Date();
      const startDate = await this.formatDate(moment(date).startOf("day"));
      const endDate = await this.formatDate(moment(date).endOf("day"));
      date.setHours(0, 0, 0, 0);
      const sevenDays = new Date();
      sevenDays.setDate(date.getDate() - 6);
      sevenDays.setHours(0, 0, 0, 0);
      try {
        const today: any = await OrderMaster.findOne({
          attributes: [
            [fn("COUNT", col("id")), "todayorder"],
            [fn("SUM", col("total")), "todayamount"],
          ],
          where: {
            adminId: 6,
            orderStatus: { [Op.ne]: "cancelled" },
            createdAt: { [Op.between]: [startDate, endDate] },
          },
          raw: true,
        });
        const last7days: any = await OrderMaster.findAll({
          attributes: [
            [fn("DATE", col("createdAt")), "label"],
            [fn("SUM", col("total")), "value"],
          ],
          where: {
            adminId: 6,
            orderStatus: { [Op.ne]: "cancelled" },
            createdAt: { [Op.gte]: sevenDays },
          },
          group: [fn("DATE", col("createdAt"))],
          order: [[fn("DATE", col("createdAt")), "ASC"]],
          raw: true,
        });
        const formattedData = last7days.map((item: any) => ({
          label: moment(item.label).format("D"),
          value: Number(item.value) || 0,
        }));

        const topBranch = await OrderMaster.findOne({
          attributes: [
            "companyId",
            [fn("SUM", col("OrderMaster.total")), "totalSales"],
            [fn("COUNT", col("OrderMaster.id")), "totalOrders"],
          ],
          where: {
            adminId: 6,
            orderStatus: { [Op.ne]: "cancelled" },
            createdAt: { [Op.between]: [startDate, endDate] },
          },
          group: ["companyId", "CompanyMaster.id"],
          include: [{ model: CompanyMaster, attributes: ["id", "bname"] }],
          order: [[fn("SUM", col("OrderMaster.total")), "DESC"]],
          raw: true,
          nest: true,
        });

        const topProduct = await OrderItems.findOne({
          attributes: [
            "productId",
            [fn("SUM", col("OrderItems.quantity")), "totalSold"],
          ],
          include: [
            {
              model: ProductMaster,
              attributes: ["idescription", "sp_price"],
            },
          ],
          where: {
            orderStatus: { [Op.ne]: "cancelled" },
            createdAt: { [Op.between]: [startDate, endDate] },
          },
          group: ["OrderItems.productId"],
          order: [[fn("SUM", col("OrderItems.quantity")), "DESC"]],
          raw: true,
          nest: true,
        });

        let obj = {
          today_amount: today?.todayamount,
          today_order: today?.todayorder,
          chart: formattedData,
          today_branch: topBranch,
          today_product: topProduct,
        };
        resolve(new CommonResponseDto(obj, true, "Data fetch successfully"));
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async Home1(pageOpt: ReportQueryDto, userId: number) {
    return new Promise(async (resolve, reject) => {
      const date = new Date();
      const startDate = await this.formatDate(moment(date).startOf("day"));
      const endDate = await this.formatDate(moment(date).endOf("day"));
      date.setHours(0, 0, 0, 0);
      const sevenDays = new Date();
      sevenDays.setDate(date.getDate() - 6);
      sevenDays.setHours(0, 0, 0, 0);

      const whereCondition: any = {
        adminId: userId,
        orderStatus: { [Op.ne]: "cancelled" },
        createdAt: { [Op.between]: [startDate, endDate] },
      };

      if (pageOpt?.branchId) {
        whereCondition.companyId = Number(pageOpt.branchId);
      }
      try {
        const today: any = await OrderMaster.findOne({
          attributes: [
            [fn("COUNT", col("id")), "todayorder"],
            [fn("SUM", col("total")), "todayamount"],
          ],
          where: whereCondition,
          raw: true,
        });
        const last7days: any = await OrderMaster.findAll({
          attributes: [
            [fn("DATE", col("createdAt")), "label"],
            [fn("SUM", col("total")), "value"],
          ],
          where: whereCondition,
          group: [fn("DATE", col("createdAt"))],
          order: [[fn("DATE", col("createdAt")), "ASC"]],
          raw: true,
        });
        const formattedData = last7days.map((item: any) => ({
          label: moment(item.label).format("D"),
          value: Number(item.value) || 0,
        }));

        const topBranch = await OrderMaster.findOne({
          attributes: [
            "companyId",
            [fn("SUM", col("OrderMaster.total")), "totalSales"],
            [fn("COUNT", col("OrderMaster.id")), "totalOrders"],
          ],
          where: whereCondition,
          group: ["companyId", "CompanyMaster.id"],
          include: [{ model: CompanyMaster, attributes: ["id", "bname"] }],
          order: [[fn("SUM", col("OrderMaster.total")), "DESC"]],
          raw: true,
          nest: true,
        });

        const topProduct = await OrderItems.findOne({
          attributes: [
            "productId",
            [
              fn("SUM", literal("OrderItems.sp_price * OrderItems.quantity")),
              "totalAmount",
            ],
            [fn("SUM", col("OrderItems.quantity")), "totalSold"],
          ],
          include: [
            {
              model: ProductMaster,
              attributes: ["idescription", "sp_price"],
            },
          ],
          where: {
            ...(pageOpt?.branchId && { companyId: pageOpt.branchId }),
            orderStatus: { [Op.ne]: "cancelled" },
            createdAt: { [Op.between]: [startDate, endDate] },
          },
          group: ["OrderItems.productId"],
          order: [[fn("SUM", col("OrderItems.quantity")), "DESC"]],
          raw: true,
          nest: true,
        });

        let obj = {
          today_amount: today?.todayamount,
          today_order: today?.todayorder,
          chart: formattedData,
          today_branch: topBranch,
          today_product: topProduct,
        };
        resolve(new CommonResponseDto(obj, true, "Data fetch successfully"));
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async Reports(pageOpt: any) {
    return new Promise(async (resolve, reject) => {
      try {
        var DateCondition: any = {
          adminId: 6,
          orderStatus: { [Op.ne]: "cancelled" },
        };
        if (pageOpt?.branchId) {
          DateCondition.companyId = Number(pageOpt.branchId);
        }
        if (pageOpt?.from_date && pageOpt?.to_date) {
          const startDate = await this.formatDate(pageOpt?.from_date);
          const endDate = await this.formatDate(pageOpt?.to_date);
          DateCondition.createdAt = { [Op.between]: [startDate, endDate] };
        }
        const monthlyReport = await OrderMaster.findAll({
          attributes: [
            [fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "month"],
            [fn("SUM", col("total")), "totalSales"],
            [fn("COUNT", col("id")), "totalOrders"],
          ],
          where: DateCondition,
          group: [fn("DATE_FORMAT", col("createdAt"), "%Y-%m")],
          order: [[fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "DESC"]],
          raw: true,
        });
        resolve(
          new CommonResponseDto(monthlyReport, true, "Data fetch successfully")
        );
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async Reports1(pageOpt: ReportQueryDto, userId: number) {
    return new Promise(async (resolve, reject) => {
      try {
        var DateCondition: any = {
          adminId: userId,
          orderStatus: { [Op.ne]: "cancelled" },
        };
        if (pageOpt?.branchId) {
          DateCondition.companyId = Number(pageOpt.branchId);
        }
        if (pageOpt?.from_date && pageOpt?.to_date) {
          const startDate = await this.formatDate(pageOpt?.from_date);
          const endDate = await this.formatDate(pageOpt?.to_date);
          DateCondition.createdAt = { [Op.between]: [startDate, endDate] };
        }
        const monthlyReport = await OrderMaster.findAll({
          attributes: [
            [fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "month"],
            [fn("SUM", col("total")), "totalSales"],
            [fn("COUNT", col("id")), "totalOrders"],
          ],
          where: DateCondition,
          group: [fn("DATE_FORMAT", col("createdAt"), "%Y-%m")],
          order: [[fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "DESC"]],
          raw: true,
        });
        resolve(
          new CommonResponseDto(monthlyReport, true, "Data fetch successfully")
        );
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async BranchePicker(pageOpt: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const branches = await CompanyMaster.findAll({
          where: { adminid: 6 },
          attributes: ["id", "bname"],
        });
        resolve(
          new CommonResponseDto(branches, true, "Data fetch successfully")
        );
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async BranchePicker1(pageOpt: ReportQueryDto, userId: number) {
    return new Promise(async (resolve, reject) => {
      try {
        const branches = await CompanyMaster.findAll({
          where: { adminid: userId },
          attributes: ["id", "bname"],
        });
        resolve(
          new CommonResponseDto(branches, true, "Data fetch successfully")
        );
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async Branches(pageOpt: any) {
    return new Promise(async (resolve, reject) => {
      try {
        var DateCondition: any = {
          adminId: 6,
          orderStatus: { [Op.ne]: "cancelled" },
        };
        var searchQuery: any = {};
        if (pageOpt?.from_date && pageOpt?.to_date) {
          const startDate = await this.formatDate(pageOpt?.from_date);
          const endDate = await this.formatDate(pageOpt?.to_date);
          DateCondition.createdAt = { [Op.between]: [startDate, endDate] };
        }
        if (pageOpt?.query) {
          searchQuery.bname = { [Op.like]: `%${pageOpt.query}%` };
        }
        const branches = await OrderMaster.findAll({
          attributes: [
            "companyId",
            [fn("COUNT", col("OrderMaster.id")), "totalOrders"],
            [fn("SUM", col("OrderMaster.total")), "totalSales"],
          ],
          include: [
            {
              model: CompanyMaster,
              attributes: ["id", "bname", "fulladdress", "state"],
              where: searchQuery,
            },
          ],
          where: DateCondition,
          group: ["OrderMaster.companyId", "CompanyMaster.id"],
          order: [[fn("SUM", col("OrderMaster.total")), "DESC"]],
          raw: true,
          nest: true,
        });
        resolve(
          new CommonResponseDto(branches, true, "Data fetch successfully")
        );
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async Branches1(pageOpt: ReportQueryDto, userId: number) {
    return new Promise(async (resolve, reject) => {
      try {
        var DateCondition: any = {
          adminId: userId,
          orderStatus: { [Op.ne]: "cancelled" },
        };
        var searchQuery: any = {};
        if (pageOpt?.from_date && pageOpt?.to_date) {
          const startDate = await this.formatDate(pageOpt?.from_date);
          const endDate = await this.formatDate(pageOpt?.to_date);
          DateCondition.createdAt = { [Op.between]: [startDate, endDate] };
        }
        if (pageOpt?.query) {
          searchQuery.bname = { [Op.like]: `%${pageOpt.query}%` };
        }
        if (pageOpt?.branchId) {
          DateCondition.companyId = pageOpt.branchId;
        }
        const branches = await OrderMaster.findAll({
          attributes: [
            "companyId",
            [fn("COUNT", col("OrderMaster.id")), "totalOrders"],
            [fn("SUM", col("OrderMaster.total")), "totalSales"],
          ],
          include: [
            {
              model: CompanyMaster,
              attributes: ["id", "bname", "fulladdress", "state"],
              where: searchQuery,
            },
          ],
          where: DateCondition,
          group: ["OrderMaster.companyId", "CompanyMaster.id"],
          order: [[fn("SUM", col("OrderMaster.total")), "DESC"]],
          raw: true,
          nest: true,
        });
        resolve(
          new CommonResponseDto(branches, true, "Data fetch successfully")
        );
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async Branch_details(id: number, pageOpt: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const startDate = await this.formatDate(pageOpt?.from_date);
        const endDate = await this.formatDate(pageOpt?.to_date);
        var DateCondition: any = {
          companyId: id,
          adminId: 6,
          orderStatus: { [Op.ne]: "cancelled" },
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        };
        const data = await OrderMaster.findAll({
          attributes: [
            "companyId",
            [fn("DATE", col("createdAt")), "orderDate"],
            [fn("COUNT", col("id")), "totalOrders"],
            [fn("SUM", col("total")), "totalSales"],
          ],
          where: DateCondition,
          group: [col("orderDate")],
          order: [[col("orderDate"), "DESC"]],
          raw: true,
          nest: true,
        });
        const totals = await OrderMaster.findAll({
          attributes: [
            "companyId",
            [fn("COUNT", col("OrderMaster.id")), "totalOrders"],
            [fn("SUM", col("OrderMaster.total")), "totalSales"],
          ],
          where: DateCondition,
          group: ["OrderMaster.companyId"],
          order: [[fn("SUM", col("OrderMaster.total")), "DESC"]],
          raw: true,
          nest: true,
        });
        const branch = await CompanyMaster.findByPk(id);
        let obj = {
          totals: totals,
          branch: branch,
          data: data,
        };
        resolve(new CommonResponseDto(obj, true, "Data fetch successfully"));
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async Branch_details1(id: number, pageOpt: ReportQueryDto, userId: number) {
    return new Promise(async (resolve, reject) => {
      try {
        const startDate = await this.formatDate(pageOpt?.from_date);
        const endDate = await this.formatDate(pageOpt?.to_date);
        var DateCondition: any = {
          companyId: id,
          adminId: userId,
          orderStatus: { [Op.ne]: "cancelled" },
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        };
        const data = await OrderMaster.findAll({
          attributes: [
            "companyId",
            [fn("DATE", col("createdAt")), "orderDate"],
            [fn("COUNT", col("id")), "totalOrders"],
            [fn("SUM", col("total")), "totalSales"],
          ],
          where: DateCondition,
          group: [col("orderDate")],
          order: [[col("orderDate"), "DESC"]],
          raw: true,
          nest: true,
        });
        const totals = await OrderMaster.findAll({
          attributes: [
            "companyId",
            [fn("COUNT", col("OrderMaster.id")), "totalOrders"],
            [fn("SUM", col("OrderMaster.total")), "totalSales"],
          ],
          where: DateCondition,
          group: ["OrderMaster.companyId"],
          order: [[fn("SUM", col("OrderMaster.total")), "DESC"]],
          raw: true,
          nest: true,
        });
        const branch = await CompanyMaster.findByPk(id);
        let obj = {
          totals: totals,
          branch: branch,
          data: data,
        };
        resolve(new CommonResponseDto(obj, true, "Data fetch successfully"));
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async Products(pageOpt: any) {
    return new Promise(async (resolve, reject) => {
      try {
        var DateCondition: any = {
          orderStatus: { [Op.ne]: "cancelled" },
        };
        var searchQuery: any = { adminid: 6 };
        if (pageOpt?.branchId) {
          DateCondition.companyId = pageOpt.branchId;
        }
        if (pageOpt?.from_date && pageOpt?.to_date) {
          const startDate = await this.formatDate(pageOpt?.from_date);
          const endDate = await this.formatDate(pageOpt?.to_date);
          DateCondition.createdAt = { [Op.between]: [startDate, endDate] };
        }
        if (pageOpt?.query) {
          searchQuery.idescription = { [Op.like]: `%${pageOpt.query}%` };
        }

        const Products = await OrderItems.findAll({
          attributes: [
            "productId",
            [fn("SUM", col("OrderItems.quantity")), "totalSold"],
          ],
          include: [
            {
              model: ProductMaster,
              attributes: [
                [
                  literal(`CASE 
                    WHEN \`productMaster->productCategory\`.is_show_in_report = true 
                    THEN CONCAT(\`productMaster\`.idescription, ' - ', \`productMaster->productCategory\`.alias_name)
                    ELSE \`productMaster\`.idescription 
                  END`),
                  "idescription",
                ],
                "sp_price",
              ],
              where: searchQuery,
              required: true,
              include: [
                {
                  model: ProductCategory,
                  attributes: [
                    // "category",
                    "is_show_in_report",
                    "alias_name",
                  ],
                },
              ],
            },
          ],
          where: DateCondition,
          group: ["OrderItems.productId"],
          order: [[fn("SUM", col("OrderItems.quantity")), "DESC"]],
          raw: false,
          nest: true,
        });

        resolve(
          new CommonResponseDto(Products, true, "Data fetch successfully")
        );
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async Products1(pageOpt: ReportQueryDto, userId: number) {
    return new Promise(async (resolve, reject) => {
      try {
        var DateCondition: any = {
          orderStatus: { [Op.ne]: "cancelled" },
        };
        var searchQuery: any = { adminid: userId };
        if (pageOpt?.branchId) {
          DateCondition.companyId = pageOpt.branchId;
        }
        if (pageOpt?.from_date && pageOpt?.to_date) {
          const startDate = await this.formatDate(pageOpt?.from_date);
          const endDate = await this.formatDate(pageOpt?.to_date);
          DateCondition.createdAt = { [Op.between]: [startDate, endDate] };
        }
        if (pageOpt?.query) {
          searchQuery.idescription = { [Op.like]: `%${pageOpt.query}%` };
        }

        const Products = await OrderItems.findAll({
          attributes: [
            "productId",
            [
              fn("SUM", literal("OrderItems.sp_price * OrderItems.quantity")),
              "totalAmount",
            ],
            [fn("SUM", col("OrderItems.quantity")), "totalSold"],
            [fn("AVG", col("OrderItems.sp_price")), "averagePrice"],
          ],
          include: [
            {
              model: ProductMaster,
              attributes: [
                [
                  literal(`CASE 
                    WHEN \`productMaster->productCategory\`.is_show_in_report = true 
                    THEN CONCAT(\`productMaster\`.idescription, ' - ', \`productMaster->productCategory\`.alias_name)
                    ELSE \`productMaster\`.idescription 
                  END`),
                  "idescription",
                ],
                "sp_price",
              ],
              where: searchQuery,
              required: true,
              include: [
                {
                  model: ProductCategory,
                  attributes: [
                    // "category",
                    "is_show_in_report",
                    "alias_name",
                  ],
                },
              ],
            },
          ],
          where: DateCondition,
          group: ["OrderItems.productId"],
          order: [[fn("SUM", col("OrderItems.quantity")), "DESC"]],
          raw: false,
          nest: true,
        });

        resolve(
          new CommonResponseDto(Products, true, "Data fetch successfully")
        );
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async Product_details(id: number, pageOpt: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const startDate = await this.formatDate(pageOpt?.from_date);
        const endDate = await this.formatDate(pageOpt?.to_date);
        var DateCondition: any = {
          productId: id,
          orderStatus: { [Op.ne]: "cancelled" },
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        };
        const data = await OrderItems.findAll({
          attributes: [
            "productId",
            [fn("DATE", col("createdAt")), "prodDate"],
            [fn("COUNT", col("OrderItems.id")), "totalOrders"],
            [fn("SUM", col("OrderItems.quantity")), "totalQuantity"],
          ],
          where: DateCondition,
          group: [col("prodDate")],
          order: [[col("prodDate"), "DESC"]],
          raw: true,
          nest: true,
        });
        const totalQuantity = await OrderItems.findAll({
          attributes: [
            "productId",
            [fn("SUM", col("OrderItems.quantity")), "totalSold"],
          ],
          where: DateCondition,
          group: ["OrderItems.productId"],
          order: [[fn("SUM", col("OrderItems.quantity")), "DESC"]],
          raw: false,
          nest: false,
        });
        const product = await ProductMaster.findByPk(id);
        let obj = {
          totalQuantity: totalQuantity,
          product: product,
          data: data,
        };
        resolve(new CommonResponseDto(obj, true, "Data fetch successfully"));
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async Product_details1(id: number, pageOpt: ReportQueryDto, userId: number) {
    return new Promise(async (resolve, reject) => {
      try {
        const startDate = await this.formatDate(pageOpt?.from_date);
        const endDate = await this.formatDate(pageOpt?.to_date);
        var DateCondition: any = {
          productId: id,
          orderStatus: { [Op.ne]: "cancelled" },
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        };
        const data = await OrderItems.findAll({
          attributes: [
            "productId",
            [
              fn("SUM", literal("OrderItems.sp_price * OrderItems.quantity")),
              "totalAmount",
            ],
            [fn("DATE", col("createdAt")), "prodDate"],
            [fn("COUNT", col("OrderItems.id")), "totalOrders"],
            [fn("SUM", col("OrderItems.quantity")), "totalQuantity"],
            [fn("AVG", col("OrderItems.sp_price")), "averagePrice"],
          ],
          where: DateCondition,
          group: [col("prodDate")],
          order: [[col("prodDate"), "DESC"]],
          raw: true,
          nest: true,
        });
        const totalQuantity = await OrderItems.findAll({
          attributes: [
            "productId",
            [fn("SUM", col("OrderItems.quantity")), "totalSold"],
            [fn("AVG", col("OrderItems.sp_price")), "averagePrice"],
          ],
          where: DateCondition,
          group: ["OrderItems.productId"],
          order: [[fn("SUM", col("OrderItems.quantity")), "DESC"]],
          raw: false,
          nest: false,
        });
        const saleHistory = await OrderItems.findAll({
          attributes: [
            [col("OrderItems.sp_price"), "price"],
            [fn("SUM", col("OrderItems.quantity")), "itemsSold"],
          ],
          where: DateCondition,
          group: ["OrderItems.sp_price"],
          order: [[col("OrderItems.sp_price"), "ASC"]],
          raw: true,
        });
        const product = await ProductMaster.findByPk(id);
        let obj = {
          totalQuantity: totalQuantity,
          product: product,
          data: data,
          saleHistory: saleHistory,
        };
        resolve(new CommonResponseDto(obj, true, "Data fetch successfully"));
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }

  async ProductSaleHistory(
    id: number,
    pageOpt: ReportQueryDto,
    userId: number
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let startDate, endDate;

        if (pageOpt?.specific_date) {
          startDate = await this.formatDate(
            moment(pageOpt.specific_date).startOf("day")
          );
          endDate = await this.formatDate(
            moment(pageOpt.specific_date).endOf("day")
          );
        } else if (pageOpt?.from_date && pageOpt?.to_date) {
          startDate = await this.formatDate(pageOpt.from_date);
          endDate = await this.formatDate(pageOpt.to_date);
        } else {
          return reject(
            new CommonResponseDto(
              {},
              false,
              "Date parameter is required (specific_date or from_date/to_date)"
            )
          );
        }

        var DateCondition: any = {
          productId: id,
          orderStatus: { [Op.ne]: "cancelled" },
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        };

        if (pageOpt?.branchId) {
          DateCondition.companyId = pageOpt.branchId;
        }

        const saleHistory = await OrderItems.findAll({
          attributes: [
            [col("OrderItems.sp_price"), "price"],
            [fn("SUM", col("OrderItems.quantity")), "itemsSold"],
            [fn("DATE", col("OrderItems.createdAt")), "saleDate"],
          ],
          where: DateCondition,
          group: [
            "OrderItems.sp_price",
            fn("DATE", col("OrderItems.createdAt")),
          ],
          order: [
            [fn("DATE", col("OrderItems.createdAt")), "DESC"],
            [col("OrderItems.sp_price"), "ASC"],
          ],
          raw: true,
        });

        const product = await ProductMaster.findByPk(id, {
          attributes: ["id", "idescription", "sp_price"],
        });

        let obj = {
          product: product,
          saleHistory: saleHistory,
          dateFilter: pageOpt?.specific_date
            ? pageOpt.specific_date
            : `${pageOpt.from_date} to ${pageOpt.to_date}`,
        };

        resolve(
          new CommonResponseDto(obj, true, "Sale history fetched successfully")
        );
      } catch (err) {
        console.log("err ==>", err);
        reject(new CommonResponseDto({}, false, "No Data Found"));
      }
    });
  }
}
