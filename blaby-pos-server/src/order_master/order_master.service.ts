import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import moment from "moment";
import sequelize, { Op, Transaction } from "sequelize";
import { CompanyMaster } from "../company_master/company_master_entity";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { DiningTable } from "../dining_table/dining_table.entity";
import { OrderItems } from "../order_items/order_items.entity";
import { OrderItemsService } from "../order_items/order_items.service";
import { ProductCategory } from "../product_category/product_category_entity";
import { ProductMaster } from "../product_master/product_master";
import { PageDto, PageMetaDto } from "../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { StaffTransactions } from "../staff_transactions/staff_transactions_entity";
import { User } from "../users/user.entity";
import { CreateOrderDto, OrderItemDto } from "./dto/createOrder.dto";
import { OrderPageOptionsDto, getOrderQueryDto } from "./dto/orderMaster.dto";
import { OrderReportQueryDto } from "./dto/orderReportQuery.dto";
import { OrderRetailQueryDto } from "./dto/orderRetailQuery.dto";
import { UpdateOrderByStatusDto, UpdateOrderDto } from "./dto/updateOrder.dto";
import { OrderMaster } from "./order_master.entity";
import { generateReportTemplate } from "../shared/templates/report_template";
import { BillingCounter } from "../billing_counter/billing_counter_entity";
import { OrderPaymentDto } from "./dto/updateBill.dto";

@Injectable()
export class OrderMasterService {
  constructor(
    @Inject("OrderMasterRepository")
    private readonly orderMasterRepository: typeof OrderMaster,
    private readonly orderItemsService: OrderItemsService
  ) {}
  async create(body: CreateOrderDto, userId: number) {
    try {
      const result = await this.orderMasterRepository.sequelize.transaction(
        async (transaction: Transaction) => {
          let contactMaster: ContactMaster;
          const user = await User.findByPk(userId);
          if (!user) {
            throw new Error("User/Admin Not Found");
          }
          const staff = await ContactMaster.findByPk(body?.staffId);
          if (!staff) {
            throw new Error("Staff Not Found");
          }
          const company = await CompanyMaster.findByPk(body?.companyId);
          if (!company) {
            throw new Error("Company Not Found");
          }
          if (body?.customerId) {
            contactMaster = await ContactMaster.findByPk(body?.customerId);
            if (!contactMaster) {
              throw new Error("Customer Not Found");
            }
          }
          if (body?.orderItems?.length == 0) {
            throw new Error("No Products are Selected, Please try again.");
          }
          // const utcOffsetMinutes = Number(body.utcOffset);
          let date = new Date();
          const startedDate = moment(date).startOf("day").toDate();
          const endDate = moment(date).endOf("day").toDate();

          // //in live-server
          // const startDateWithOffset = new Date(
          //   startedDate.setMinutes(startedDate.getMinutes() + utcOffsetMinutes)
          // );
          // const endDateWithOffset = new Date(
          //   endDate.setMinutes(endDate.getMinutes() + utcOffsetMinutes)
          // );

          const totalCount = await this.orderMasterRepository.count({
            where: {
              adminId: userId,
              companyId: body.companyId,
              createdAt: {
                [Op.and]: [{ [Op.gte]: startedDate }, { [Op.lte]: endDate }],
              },
            },
          });
          let order_id = Math.round(+new Date() / 10);
          const { orderItems, ...orderDetails } = body;
          let obj = {
            ...orderDetails,
            orderId: order_id,
            adminId: userId,
            tokenNo: body?.tokenNo
              ? (body?.tokenNo).toString()
              : (totalCount ? totalCount + 1 : 1).toString(),
            total: body?.total,
          };
          const order = await this.orderMasterRepository.create(obj, {
            transaction,
          });
          let orderItemsSaved: OrderItemDto[] = [];
          for (const item of orderItems) {
            const orderItemSaved = await this.orderItemsService.createByOrder(
              { ...item, companyId: body?.companyId },
              order.id,
              transaction
            );
            orderItemsSaved.push(orderItemSaved);
          }
          let result;
          if (contactMaster) {
            result = {
              ...order.get({ plain: true }),
              orderItems: orderItemsSaved,
              customerName: contactMaster.get("name"),
            };
          } else {
            result = {
              ...order.get({ plain: true }),
              orderItems: orderItemsSaved,
            };
          }

          return result;
        }
      );
      return new CommonResponseDto(result, true, "Successfully Created Order");
    } catch (error) {
      return new CommonResponseDto({}, false, error.message);
    }
  }
  async findAllOrderCompany(
    queryData: getOrderQueryDto,
    userId: number,
    pageOptions: OrderPageOptionsDto
  ) {
    try {
      let orderStatusCondition: string[];
      if (queryData.displayType === "customer") {
        orderStatusCondition = ["pending", "started", "finished", "served"];
      } else if (queryData?.displayType === "chef") {
        orderStatusCondition = ["pending", "started"];
      } else if (queryData.displayType === "master") {
        if (queryData?.status && queryData?.status !== "all") {
          orderStatusCondition = [queryData.status];
        } else {
          orderStatusCondition = [
            "pending",
            "cancelled",
            "started",
            "finished",
            "served",
            "billed",
          ];
        }
      }

      const startedDate = new Date();
      startedDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      let productCategoryWhere = {};

      if (queryData?.idShort) {
        productCategoryWhere = { id_short: queryData.idShort };
      }
      if (queryData?.displayId) {
        productCategoryWhere = { display_id: queryData.displayId };
      }

      const entities = await this.orderMasterRepository.findAll({
        where: {
          adminId: userId,
          companyId: queryData.companyId,
          orderStatus: {
            [Op.in]: orderStatusCondition,
          },
          ...(queryData?.status === "billed" ? { billing_status: true } : {}),
          createdAt: {
            [Op.and]: [{ [Op.gte]: startedDate }, { [Op.lte]: endDate }],
          },
        },
        include: [
          {
            model: OrderItems,
            as: "orderItems",
            required: true,
            include: [
              {
                model: ProductMaster,
                as: "productMaster",
                required: true,
                include: [
                  {
                    model: ProductCategory,
                    required: true,
                    where: productCategoryWhere,
                    attributes: ["category", "id", "id_short", "display_id"],
                  },
                ],
                attributes: [
                  "id",
                  "idescription",
                  "sp_price",
                  "rate",
                  "vatamt",
                  "vat",
                  "parcel_charge",
                  "is_direct_billing",
                  "taxable_amount",
                ],
              },
            ],
          },
          {
            model: ContactMaster,
            as: "staff",
            attributes: ["id", "name"],
          },
          {
            model: DiningTable,
            as: "table_details",
            attributes: ["table_number"],
          },
          {
            model: StaffTransactions,
            as: "transactionDetails",
            attributes: [
              "id",
              "paid_amount",
              "total",
              "outstanding",
              "invoiceno",
              "paid_status",
            ],
            required: false,
          },
        ],
        subQuery: false,
        order: [["createdAt", queryData?.order || "ASC"]],
        limit: 50,
      });

      const itemCount = entities.length;
      const pageMetaDto = new PageMetaDto({
        pageOptionsDto: pageOptions,
        itemCount,
      });
      const data = new PageDto(entities, pageMetaDto);
      return new CommonResponseDto(data, true, "fetched SucessFully");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findOne(id: number, userId: number) {
    try {
      const order = await this.orderMasterRepository.findOne({
        where: {
          adminId: userId,
          id: id,
        },
        include: [
          {
            model: OrderItems,
            as: "orderItems",
            include: [
              {
                model: ProductMaster,
                as: "productMaster",
                // attributes: ["id", "idescription"],
                required: true,
              },
            ],
          },
          {
            model: ContactMaster,
            as: "customer",
            attributes: ["id", "name"],
          },
        ],
      });
      if (!order) {
        return new CommonResponseDto({}, false, "Order Not Found");
      }
      // Now you can access customer name for each order master
      return new CommonResponseDto(order, true, "successfully Fetched");
    } catch (error) {
      // Handle error
      return new CommonResponseDto(
        [],
        false,
        "Something Went Wrong in Our End...."
      );
    }
  }
  async updateOrderByStatus2(body: UpdateOrderByStatusDto, userId: number) {
    try {
      const result = await this.orderMasterRepository.sequelize.transaction(
        async (transaction: Transaction) => {
          const order = await this.orderMasterRepository.findByPk(body?.id);
          if (!order && userId !== order?.adminId) {
            throw new Error("Invalid Order.Please try Again");
          }
          order.orderStatus = body.orderStatus;
          const data = await order.save({ transaction });
          const updatedOrderItems = await OrderItems.update(
            { orderStatus: body.orderStatus },
            {
              where: {
                orderId: body.id,
              },
              transaction,
            }
          );
          const result = {
            ...data.get({ plain: true }),
            orderItems: updatedOrderItems,
          };
          return result;
        }
      );
      return new CommonResponseDto(result, true, "Successfully Updated Order");
    } catch (error) {
      return new CommonResponseDto({}, false, error.message);
    }
  }

  async updateOrderByStatus(body: UpdateOrderByStatusDto, userId: number) {
    try {
      const result = await this.orderMasterRepository.sequelize.transaction(
        async (transaction: Transaction) => {
          const order = await this.orderMasterRepository.findByPk(body?.id);
          if (!order && userId !== order?.adminId) {
            throw new Error("Invalid Order.Please try Again");
          }

          if (body?.items?.length) {
            for (const item of body.items) {
              await OrderItems.update(
                { orderStatus: item.status },
                {
                  where: {
                    orderId: body.id,
                    id: item.id,
                  },
                  transaction,
                }
              );
            }

            const allOrderItems = await OrderItems.findAll({
              where: { orderId: body.id },
              attributes: ["orderStatus"],
              transaction,
            });
            const orderStatus = this.calculateOrderStatus(allOrderItems);

            let billing_status = order.billing_status;
            if (orderStatus === "billed" || body.orderStatus === "billed") {
              billing_status = true;
            }
            order.orderStatus = orderStatus;
            order.billing_status = billing_status;
            const data = await order.save({ transaction });

            const result = {
              ...data.get({ plain: true }),
              allOrderItems,
            };
            return result;
          }
        }
      );
      return new CommonResponseDto(result, true, "Successfully Updated Order");
    } catch (error) {
      console.log(error);
      return new CommonResponseDto({}, false, error.message);
    }
  }

  private calculateOrderStatus(items: OrderItems[]): string {
    if (!items.length) return "started";
    const statusCounts = items.reduce((counts, item) => {
      counts[item.orderStatus] = (counts[item.orderStatus] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const totalItems = items.length;
    const statuses = Object.keys(statusCounts);

    if (statuses.length === 1) {
      return statuses[0];
    }

    // if (statusCounts["cancelled"] === totalItems) {
    //   return "cancelled";
    // }

    // if (statusCounts["billed"] === totalItems) {
    //   return "billed";
    // }

    // if (statusCounts["served"] === totalItems) {
    //   return "served";
    // }

    if (statusCounts["finished"]) {
      const onlyFinishedAndCancelled = statuses.every(
        (s) => s === "finished" || s === "cancelled"
      );
      if (onlyFinishedAndCancelled) {
        return "finished";
      }
      return "started";
    }
    if (statusCounts["pending"] === totalItems) {
      return "pending";
    }
    if (statusCounts["started"]) {
      return "started";
    }
    return "started";
  }
  async findAllOrderRetail(
    queryData: OrderRetailQueryDto,
    userId: number,
    companyId: string
  ) {
    try {
      const { from, to, status } = queryData;
      const skip = (queryData.page - 1) * queryData.take;
      const whereCondition: any = {
        adminId: userId,
        companyId: companyId,
        orderStatus: {
          [Op.notIn]: ["billed"],
        },
      };
      if (status && status !== "all" && status !== "" && status !== "billed") {
        whereCondition["orderStatus"] = status;
      }

      if (status === "allWithoutCancel") {
        whereCondition["orderStatus"] = {
          [Op.notIn]: ["billed", "cancelled"],
        };
        whereCondition["billing_status"] = false;
      }
      if (status === "billed") {
        whereCondition["billing_status"] = true;
        whereCondition["orderStatus"] = {
          [Op.notIn]: ["cancelled"],
        };
      }

      if (queryData.orderId) {
        whereCondition["orderId"] = queryData.orderId;
        delete whereCondition["createdAt"];
      }
      if (from && to && from !== "" && to !== "") {
        const startedDate = moment(from).startOf("day").toISOString();
        const endDate = moment(to).endOf("day").toISOString();
        // const startedDate = new Date(from);
        // const endDate = new Date(to).setHours(23, 59, 59, 999);
        whereCondition["createdAt"] = {
          [Op.and]: [{ [Op.gte]: startedDate }, { [Op.lte]: endDate }],
        };
      }

      if (queryData?.search) {
        whereCondition["tokenNo"] = queryData?.search;
      }

      if (queryData?.staffId) {
        whereCondition["staffId"] = queryData?.staffId;
      }

      const orderAll = await this.orderMasterRepository.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: OrderItems,
            as: "orderItems",
            include: [
              {
                model: ProductMaster,
                as: "productMaster",
                required: true,
              },
            ],
          },
          {
            model: ContactMaster,
            as: "customer",
            attributes: ["name"],
            required: false,
          },
          {
            model: DiningTable,
            as: "table_details",
            attributes: ["table_number"],
            required: false,
          },
        ],
        distinct: true, // Ensure distinct records
        col: "id",
        order: [["createdAt", queryData.order]],
        limit: queryData.take,
        offset: skip,
      });
      const entities = orderAll.rows;
      const itemCount = orderAll.count;
      const pageMetaDto = new PageMetaDto({
        pageOptionsDto: queryData,
        itemCount,
      });
      const data = new PageDto(entities, pageMetaDto);
      return new CommonResponseDto(data, true, "fetched SucessFully");
      // Now you can access customer name for each order master
    } catch (error) {
      // Handle error
      console.log(error);
      return new CommonResponseDto(
        [],
        false,
        "Something Went Wrong in Our End...."
      );
    }
  }
  async update(update: UpdateOrderDto, userId: number) {
    try {
      const result = await this.orderMasterRepository.sequelize.transaction(
        async (transaction: Transaction) => {
          const order = await this.orderMasterRepository.findByPk(update.id);
          if (!order) {
            throw new Error("Order Not Found");
          }
          if (
            order.companyId != update.companyId &&
            order.adminId != userId &&
            order.orderStatus === "billed"
          ) {
            throw new Error("Invalid Order");
          }
          if (update.orderItems.length === 0) {
            throw new Error("No Products are Selected, Please try again.");
          }
          // const { id, companyId, orderItems, ...obj } = update;
          let obj = {
            cooking_instructions: update?.cooking_instructions,
            customerId: update?.customerId,
            companyId: order.companyId,
            customerCount: update?.customerCount,
            orderStatus: "pending",
            table_id: update?.table_id,
            total: update?.total,
          };
          const updatedOrder = await order.update(obj, { transaction });

          let { orderItems } = update;
          let orderItemsSaved: OrderItemDto[] = [];
          let updatedOrdersId: number[] = [];
          for (const item of orderItems) {
            const orderItemSaved = await this.orderItemsService.updateByOrder(
              { ...item, companyId: order.companyId },
              order.id,
              transaction
            );
            updatedOrdersId.push(orderItemSaved.id);
            orderItemsSaved.push(orderItemSaved);
          }
          const deleteOrderItems = await OrderItems.destroy({
            where: {
              orderId: update?.id,
              id: {
                [Op.notIn]: updatedOrdersId,
              },
            },
            transaction,
          });
          let result = {
            ...updatedOrder.get({ plain: true }),
            orderItems: orderItemsSaved,
          };
          return result;
        }
      );
      return new CommonResponseDto(result, true, "Successfully Updated Order");
    } catch (error) {
      return new CommonResponseDto({}, false, error.message);
    }
  }

  private getStatusCondition(status: string) {
    if (status === "all") {
      return {};
    }
    if (status === "allWithoutCancel") {
      return {
        orderStatus: {
          [Op.ne]: "cancelled",
        },
      };
    }
    return { orderStatus: status };
  }

  private getDateCondition(from?: any, to?: any) {
    if (!from && !to) return {};

    const dateCondition: any = {};
    if (from) {
      dateCondition[Op.gte] = new Date(from);
    }
    if (to) {
      dateCondition[Op.lte] = new Date(to);
    }

    return { createdAt: dateCondition };
  }

  async generateReport(companyId: number, queryParams: OrderReportQueryDto) {
    try {
      const { categoryId, productId, from, to, status, dateRange, page, take } =
        queryParams;
      const skip = (Number(page) - 1) * Number(take);

      const today = new Date();
      let startDate: Date;
      let endDate: Date = new Date(today.setHours(23, 59, 59, 999));

      if (from && to) {
        startDate = new Date(from);
        endDate = new Date(to);
      }

      if (dateRange === "today") {
        startDate = new Date(today.setHours(0, 0, 0, 0));
      } else if (dateRange === "yesterday") {
        startDate = new Date(today.setDate(today.getDate() - 1));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
      } else if (dateRange === "thisMonth") {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      } else if (dateRange === "lastMonth") {
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          0,
          23,
          59,
          59,
          999
        );
      } else if (dateRange === "last30Days") {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === "last6Month") {
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 6);
        startDate.setHours(0, 0, 0, 0);
      }

      // Base where condition
      const baseWhere = {
        companyId,
        ...this.getStatusCondition(status),
        ...this.getDateCondition(startDate, endDate),
      };

      // Product filter condition
      const productWhere = productId ? { id: productId } : {};
      if (categoryId) {
        productWhere["product_category"] = categoryId;
      }

      const productStats = await OrderItems.findAll({
        attributes: [
          "productId",
          [
            sequelize.fn("SUM", sequelize.col("OrderItems.quantity")),
            "total_quantity",
          ],
          [
            sequelize.literal(
              "SUM(OrderItems.quantity * productMaster.sp_price)"
            ),
            "total_amount",
          ],
          "orderStatus",
        ],
        include: [
          {
            model: ProductMaster,
            attributes: [
              "id",
              "idescription",
              "rate",
              "sp_price",
              "product_category",
            ],
            where: productWhere,
            required: true,
            include: [
              {
                model: ProductCategory,
                attributes: ["id", "category", "categoryType"],
                required: true,
              },
            ],
          },
          {
            model: OrderMaster,
            where: baseWhere,
            attributes: [
              // 'orderStatus',
              "companyId",
            ],
            required: true,
          },
        ],
        group: [
          "OrderItems.productId",
          "OrderItems.orderStatus",
          "OrderMaster.companyId",
          "productMaster.id",
          "productMaster.product_category",
        ],
        raw: true,
      });

      const transformedData = Object.values(
        productStats.reduce((acc: any, curr: any) => {
          const productId = curr["productMaster.id"];
          const price = parseFloat(curr["productMaster.sp_price"]);
          const quantity = parseInt(curr.total_quantity);
          const itemTotal = quantity * price;

          if (!acc[productId]) {
            acc[productId] = {
              productId: productId,
              productName: curr["productMaster.idescription"],
              category_name: curr["productMaster.productCategory.category"],
              finishedItems: 0,
              pendingItems: 0,
              cancelledItems: 0,
              startedItems: 0,
              billedItems: 0,
              servedItems: 0,
              finishedItemTotal: 0,
              pendingItemTotal: 0,
              cancelledItemTotal: 0,
              billedItemTotal: 0,
              servedItemTotal: 0,
              startedItemTotal: 0,
              itemPrice: price,
              totalAmount: 0,
            };
          }

          // Update quantities and totals based on order status
          switch (curr.orderStatus) {
            case "finished":
              acc[productId].finishedItems += quantity;
              acc[productId].finishedItemTotal += itemTotal;
              break;
            case "pending":
              acc[productId].pendingItems += quantity;
              acc[productId].pendingItemTotal += itemTotal;
              acc[productId].totalAmount += itemTotal;
              break;
            case "cancelled":
              acc[productId].cancelledItems += quantity;
              acc[productId].cancelledItemTotal += itemTotal;
              break;
            case "started":
              acc[productId].startedItems += quantity;
              acc[productId].startedItemTotal += itemTotal;
              acc[productId].totalAmount += itemTotal;
              break;
            case "served":
              acc[productId].servedItems += quantity;
              acc[productId].servedItemTotal += itemTotal;
              acc[productId].totalAmount += itemTotal;
              break;
            case "billed":
              acc[productId].billedItems += quantity;
              acc[productId].billedItemTotal += itemTotal;
              acc[productId].totalAmount += itemTotal;
              break;
          }

          return acc;
        }, {})
      );

      const overallTotal = transformedData.reduce((sum: number, item: any) => {
        return sum + item.totalAmount;
      }, 0);
      let responseData = {
        data: transformedData,
        overallTotal: overallTotal,
      };

      return new CommonResponseDto(
        responseData,
        true,
        "Report data fetched successfully"
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sendWhatsappReport() {
    try {
      let today = new Date();
      let endDate = moment(new Date(today.setHours(23, 59, 59, 999))).format(
        "DD-MM-YYYY hh:mm A"
      );
      let startDate = moment(new Date(today.setHours(0, 0, 0, 0))).format(
        "DD-MM-YYYY hh:mm A"
      );
      let caption = `Hi *Blaby Westfield Hotel*,\n\nPlease find attached the latest report for Blaby Westfield Hotel from *${startDate}* to *${endDate}*.`;
      const reportData = await this.generateReport(157, {
        dateRange: "today",
        status: "all",
      });

      console.log("reportData===>", reportData);

      const formData: any = new FormData();
      const blob = new Blob(["Hello, this is a sample file"], {
        type: "text/plain",
      });
      formData.append("number", "+919645232115");
      const generateTemplate = generateReportTemplate(reportData.data); // data?.pdfBuffer
      formData.append("file", blob, {
        filename: `report-${new Date()}.pdf`,
        contentType: "application/pdf",
      });
      formData.append("caption", caption);
      // const response = await axios.post(
      //   "https://bairuha-messaging.bairuhatech.com/sendPdf",
      //   formData,
      //   {
      //     headers: {
      //       ...formData.getHeaders(),
      //     },
      //   }
      // );
      // return response.data;
      return reportData.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateBill(create: OrderPaymentDto, userId: number) {
    try {
      const result = await this.orderMasterRepository.sequelize.transaction(
        async (transaction: Transaction) => {
          const order = await this.orderMasterRepository.findByPk(
            create?.orderId,
            { transaction }
          );
          if (!order) {
            throw new NotFoundException("Order not found");
          }

          const counter = await BillingCounter.findByPk(create?.counterId, {
            transaction,
          });
          if (!counter) {
            throw new NotFoundException("Counter not found");
          }

          if (Array.isArray(create?.payments) && create?.payments?.length > 0) {
            const totalPaidAmount = create.payments.reduce((sum, payment:any) => {
              if (payment.paymentMethod === "Credit") {
                return sum; 
              }
              return sum + parseFloat(payment.amount);
            }, 0);
            console.log("totalPaidAmount",totalPaidAmount,"parseFloat(order.total.toString())",parseFloat(order.total.toString()))
            const orderTotal = parseFloat(order.total.toString());
            const totalPayload = parseFloat(create.total);

            let paidStatus: number;
            if (totalPaidAmount >= orderTotal) {
              paidStatus = 2; // Fully paid
            } else if (totalPaidAmount > 0) {
              paidStatus = 1; // Partially paid
            } else {
              paidStatus = 0; // Not paid
            }

            if (Math.abs(totalPayload - orderTotal) > 0.01) {
              throw new BadRequestException(
                "Total amount mismatch between payload and order"
              );
            }

            const staffTransactionPromises = create.payments.map(
              async (payment) => {
                const staffTransactionData = {
                  adminid: userId,
                  companyid: create.companyId,
                  ledger: "47",
                  ledgercategory: "3",
                  type: "Customer Receipt" as any,
                  usertype: "staff",
                  paid_amount:
                    payment?.paymentMethod === "Credit"
                      ? parseFloat(create.total) -
                        parseFloat(create.creditBalance)
                      : parseFloat(payment.amount),
                  total: parseFloat(create.total),
                  outstanding: create.creditBalance
                    ? parseFloat(create.creditBalance)
                    : 0,
                  saleid: null,
                  customerid: null,
                  shiftid: create.shiftId,
                  purchaseid: null,
                  journalid: null,
                  invoiceno: null,
                  saletype: "retail Xpress",
                  paymethod: payment.paymentMethod,
                  overall_parcel_charge: null,
                  staffid: create.staffId,
                  status: "open",
                  paid_status: paidStatus,
                  sdate: new Date(),
                  counterid: create.counterId,
                  order_id: order.id,
                  customer_name:
                    payment?.paymentMethod === "Credit" ? payment.customerName:null,
                };

                return await StaffTransactions.create(staffTransactionData, {
                  transaction,
                });
              }
            );

            await Promise.all(staffTransactionPromises);

            await order.update(
              {
                orderStatus: "billed",
                billing_status: true,
                shift_id : create?.shiftId
              },
              { transaction }
            );

            return new CommonResponseDto(
              {
                orderId: order.id,
                totalPaid: totalPaidAmount,
                paidStatus: paidStatus,
                transactionCount: create.payments.length,
              },
              true,
              "Bill updated successfully"
            );
          } else {
            throw new BadRequestException("No payments provided");
          }
        }
      );

      return result;
    } catch (error) {
      console.error("Error in updateBill:", error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException("Failed to update bill");
    }
  }
}
