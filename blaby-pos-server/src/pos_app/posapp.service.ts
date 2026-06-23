import { Injectable } from "@nestjs/common";
import { col, fn, Op, Transaction } from "sequelize";
import moment from "moment";

import { PageDto, PageMetaDto } from "../shared/dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { OrderDto, OrderItemDto } from "./dto/order.dto";

import { OrderMaster } from "../order_master/order_master.entity";
import { OrderItems } from "../order_items/order_items.entity";
import { ProductMaster } from "../product_master/product_master";
import { DiningTable } from "../dining_table/dining_table.entity";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { User } from "../users/user.entity";
import { CompanyMaster } from "../company_master/company_master_entity";

import { OrderItemsService } from "../order_items/order_items.service";
import { Data } from "./dto/query.dto";

@Injectable()
export class PosAppService {
  constructor(private readonly orderItemsService: OrderItemsService) {}
  async orderList(pageOpt: Data) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          companyId,
          staffId,
          adminId,
          status,
          order,
          page,
          take,
          search,
          shiftId,
          table_name,
        } = pageOpt;
        const skip = (page - 1) * take;
        const whereCondition: any = {
          adminId: Number(adminId),
          companyId: Number(companyId),
        };
        if (staffId) {
          whereCondition["staffId"] = Number(staffId);
        }
        if (search) {
          whereCondition["tokenNo"] = search;
        }
        if (status === "all") {
        } else {
          whereCondition["orderStatus"] = status;
        }
        if (shiftId) {
          whereCondition["shift_id"] = shiftId;
        }
        if (table_name) {
          if (Number(table_name) === 0) {
          } else {
            whereCondition["table_id"] = Number(table_name);
          }
        }

        let allOrders: any = await OrderMaster.findAndCountAll({
          distinct: true, 
          col: "id",
          include: [
            {
              model: OrderItems,
              as: "orderItems",
              include: [
                {
                  model: ProductMaster,
                  as: "productMaster",
                  required: true,
                  attributes: ["id", "idescription", "sp_price", "vat"],
                },
              ],
            },
            {
              model: DiningTable,
              as: "table_details",
              attributes: ["id", "table_number"],
              required: false,
            },
            {
              model: ContactMaster,
              as: "staff",
              attributes: ["name"],
              required: false,
            },
          ],
          where: whereCondition,
          order: [[status !== "pending" ? "updatedAt" : "createdAt", order]],
          limit: Number(take),
          offset: Number(skip),
        });


        
        if (table_name && Number(table_name) != 0) {
          allOrders.rows = allOrders?.rows.filter(
            (order) => order?.table_details !== null
          );
        }
        const entities = allOrders.rows;
        const itemCount = allOrders?.count;
        const pageMetaDto = new PageMetaDto({
          pageOptionsDto: { page: pageOpt?.page, take: pageOpt?.take, skip },
          itemCount,
        });
        const data = new PageDto(entities, pageMetaDto);
        let message = "fetched SucessFully";
        resolve(new CommonResponseDto(data, true, message));
      } catch (err) {
        console.log("err = = = >", err);
        let message = "Something Went Wrong in Our End....";
        resolve(new CommonResponseDto([], false, message));
      }
    });
  }

  // async orderStatics(pageOpt: any) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const { companyId, staffId, adminId } = pageOpt;
  //       const whereCondition: any = {
  //         adminId: Number(adminId),
  //         companyId: Number(companyId),
  //       };
  //       if (staffId) {
  //         whereCondition["staffId"] = Number(staffId);
  //       }
  //       whereCondition.orderStatus = { [Op.ne]: "cancelled" };
  //       const result = await OrderMaster.findAll({
  //         attributes: [
  //           [fn("COUNT", col("id")), "count"],
  //           [fn("SUM", col("total")), "sum"],
  //         ],
  //         where: whereCondition,
  //         raw: true,
  //       });
  //       const data = result?.length ? result[0] : {};
  //       let message = "fetched SucessFully";
  //       resolve(new CommonResponseDto(data, true, message));
  //     } catch (err) {
  //       console.log("err = = = >", err);
  //       let message = "Something Went Wrong in Our End....";
  //       resolve(new CommonResponseDto([], false, message));
  //     }
  //   });
  // }

  async orderStatics(pageOpt: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const { companyId, staffId, adminId } = pageOpt;
        const whereCondition: any = {
          adminId: Number(adminId),
          companyId: Number(companyId),
        };

        const company = await CompanyMaster.findByPk(companyId, {
          attributes: ["workingTimeTo", "workingTimeFrom"],
        });

        if (!company) {
          throw new Error("Company not found");
        }

        const { workingTimeFrom, workingTimeTo } = company;

        if (staffId) {
          whereCondition["staffId"] = Number(staffId);
        }

        whereCondition.orderStatus = { [Op.ne]: "cancelled" };

        const parseTime = (timeStr: string) => {
          // Guard against missing/malformed working-time settings.
          if (!timeStr || typeof timeStr !== "string") {
            return null;
          }
          const [time, period] = timeStr.trim().split(" ");
          if (!time || !time.includes(":")) {
            return null;
          }
          const [hours, minutes] = time.split(":").map(Number);
          if (Number.isNaN(hours) || Number.isNaN(minutes)) {
            return null;
          }

          let hour24 = hours;
          if (period === "PM" && hours !== 12) {
            hour24 = hours + 12;
          } else if (period === "AM" && hours === 12) {
            hour24 = 0;
          }

          return { hours: hour24, minutes };
        };

        const fromTime = parseTime(workingTimeFrom);
        const toTime = parseTime(workingTimeTo);

        // Custom time-based filtering logic
        const now = new Date();
        const currentHour = now.getHours();
        let startDate: Date;
        let endDate: Date;

        if (!fromTime || !toTime) {
          // Working times not configured/invalid — fall back to a plain
          // today window (midnight to midnight) so totals still show.
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0,
            0,
            0
          );
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59
          );
          whereCondition.createdAt = {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          };

          const result = await OrderMaster.findAll({
            attributes: [
              [fn("COUNT", col("id")), "count"],
              [fn("SUM", col("total")), "sum"],
            ],
            where: whereCondition,
            raw: true,
          });

          const data = result?.length ? result[0] : {};
          resolve(new CommonResponseDto(data, true, "fetched Successfully"));
          return;
        }

        // Check if working hours span across two days (e.g., 11:00 AM to 3:00 AM next day)
        const isNextDayOperation = toTime.hours < fromTime.hours;

        if (isNextDayOperation) {
          // Cross-day operation (e.g., 11:00 AM to 3:00 AM next day)
          if (currentHour > toTime.hours) {
            // After end time: Get data from today's start time to tomorrow's end time
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              fromTime.hours,
              fromTime.minutes,
              0
            ); // Today start time
            endDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() + 1,
              toTime.hours,
              toTime.minutes,
              0
            ); // Tomorrow end time
          } else {
            // Between 12:00 AM to end time: Get data from yesterday's start time to today's end time
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - 1,
              fromTime.hours,
              fromTime.minutes,
              0
            ); // Yesterday start time
            endDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              toTime.hours,
              toTime.minutes,
              0
            ); // Today end time
          }
        } else {
          // Same day operation (e.g., 9:00 AM to 6:00 PM)
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            fromTime.hours,
            fromTime.minutes,
            0
          ); // Today start time
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            toTime.hours,
            toTime.minutes,
            0
          ); // Today end time
        }

        // Add time-based filtering to where condition
        whereCondition.createdAt = {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        };


        const result = await OrderMaster.findAll({
          attributes: [
            [fn("COUNT", col("id")), "count"],
            [fn("SUM", col("total")), "sum"],
          ],
          where: whereCondition,
          raw: true,
        });

        // TEMP DIAGNOSTIC — remove once Total Amount is confirmed working.
        const diagCount = await OrderMaster.count({
          where: { companyId: Number(companyId) },
        });
        console.log("[orderStatics] DIAG", {
          companyId: Number(companyId),
          adminId: Number(adminId),
          staffId: staffId ? Number(staffId) : "(none)",
          workingTimeFrom,
          workingTimeTo,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          windowResult: result?.[0],
          totalOrdersForCompanyAllTime: diagCount,
        });

        const data = result?.length ? result[0] : {};
        let message = "fetched Successfully";

        resolve(new CommonResponseDto(data, true, message));
      } catch (err) {
        console.log("err = = = >", err);
        let message = "Something Went Wrong in Our End....";
        resolve(new CommonResponseDto([], false, message));
      }
    });
  }

  async createOrder(body: OrderDto) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await OrderMaster.sequelize.transaction(
          async (transaction: Transaction) => {
            let contactMaster: ContactMaster;
            const user = await User.findByPk(body?.userId);
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
            let date = new Date();
            const startedDate = moment(date).startOf("day").toDate();
            const endDate = moment(date).endOf("day").toDate();
            const totalCount = await OrderMaster.count({
              where: {
                adminId: body?.userId,
                companyId: body.companyId,
                createdAt: {
                  [Op.and]: [{ [Op.gte]: startedDate }, { [Op.lte]: endDate }],
                },
              },
            });
            let order_id = Math.round(+new Date() / 10);
            const { orderItems } = body;
            let obj = {
              orderId: order_id,
              adminId: body?.userId,
              companyId: body?.companyId,
              staffId: body?.staffId,
              shift_id: body?.shift_id,
              utcOffset: body?.utcOffset,
              total: body?.total,
              ac_room: body?.ac_room,
              ac_charge:body?.ac_charge,
              billing_status: body?.billing_status,
              cooking_instructions: body?.cooking_instructions,
              paymentMethod: body?.paymentMethod || null,
              tokenNo: body?.tokenNo
                ? (body?.tokenNo).toString()
                : (totalCount ? totalCount + 1 : 1).toString(),
            };
            if (body?.table_details) {
              obj["table_id"] = body?.table_details;
            }
            const order = await OrderMaster.create(obj, { transaction });
            let orderItemsSaved: OrderItemDto[] = [];
            for (const item of orderItems) {
              const orderItemSaved = await this.orderItemsService.createByOrder(
                { ...item, companyId: body?.companyId },
                order.id,
                transaction
              );
              orderItemsSaved.push(orderItemSaved);
            }
            let result: any = {};
            result = {
              ...order.get({ plain: true }),
              orderItems: orderItemsSaved,
            };
            return result;
          }
        );
        let message = "Order Created Successfully";
        resolve(new CommonResponseDto(result, true, message));
      } catch (err) {
        console.log("err = = = >", err);
        let message = "Something Went Wrong in Our End....";
        resolve(new CommonResponseDto([], false, message));
      }
    });
  }

  async updateOrder(body: OrderDto) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await OrderMaster.sequelize.transaction(
          async (transaction: Transaction) => {
            const order = await OrderMaster.findByPk(body.id);
            if (!order) {
              let message = "Order not found";
              resolve(new CommonResponseDto({}, false, message));
            } else if (
              order.companyId != body.companyId &&
              order.adminId != body?.userId &&
              order.orderStatus === "billed"
            ) {
              let message = "Invalid Order";
              resolve(new CommonResponseDto({}, false, message));
            } else {
              let obj = {
                adminId: body?.userId,
                companyId: body?.companyId,
                staffId: body?.staffId,
                shift_id: body?.shift_id,
                utcOffset: body?.utcOffset,
                total: body?.total,
                ac_room: body?.ac_room,
                ac_charge:body?.ac_charge,
                cooking_instructions: body?.cooking_instructions,
                paymentMethod: body?.paymentMethod || null,
                tokenNo: body?.tokenNo,
              };
              if (body?.table_details) {
                obj["table_id"] = body?.table_details;
              }
              const updatedOrder = await order.update(obj, { transaction });
              let orderItemsSaved: OrderItemDto[] = [];
              if (body?.orderItems?.length) {
                await OrderItems.destroy({
                  where: { orderId: order.id },
                  transaction,
                });
                for (const item of body?.orderItems) {
                  const orderItemSaved =
                    await this.orderItemsService.createByOrder(
                      { ...item, companyId: body?.companyId },
                      order.id,
                      transaction
                    );
                  orderItemsSaved.push(orderItemSaved);
                }
                let result: any = {};
                result = {
                  ...order.get({ plain: true }),
                  orderItems: orderItemsSaved,
                };
                return result;
              }
            }
          }
        );
        let message = "Order Updated Successfully";
        resolve(new CommonResponseDto(result, true, message));
      } catch (err) {
        console.log("err = = = >", err);
        let message = "Something Went Wrong in Our End....";
        resolve(new CommonResponseDto([], false, message));
      }
    });
  }

  async updateStatus(pageOpt: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await OrderMaster.sequelize.transaction(
          async (transaction: Transaction) => {
            const order = await OrderMaster.findByPk(pageOpt.orderId);
            if (!order) {
              let message = "Order not found";
              resolve(new CommonResponseDto({}, false, message));
            } else if (order.orderStatus === "billed") {
              let message = "Invalid Order";
              resolve(new CommonResponseDto({}, false, message));
            } else {
              let order_status = order?.orderStatus;
              let billing_status = order?.billing_status;
              if (pageOpt.status === "billed") {
                billing_status = true;
              } else {
                order_status = pageOpt.status;
              }
              order.orderStatus = order_status;
              order.billing_status = billing_status;
              const data = await order.save({ transaction });
              const updatedOrderItems = await OrderItems.update(
                { orderStatus: pageOpt.status },
                { where: { orderId: pageOpt.orderId }, transaction }
              );
              const result = {
                ...data.get({ plain: true }),
                orderItems: updatedOrderItems,
              };
              return result;
            }
          }
        );
        let message = "Order Updated Successfully";
        resolve(new CommonResponseDto(result, true, message));
      } catch (err) {
        console.log("err = = = >", err);
        let message = "Something Went Wrong in Our End....";
        resolve(new CommonResponseDto([], false, message));
      }
    });
  }

  async updatePaymentMethod(pageOpt: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const order = await OrderMaster.findByPk(pageOpt.orderId);
        if (!order) {
          resolve(new CommonResponseDto({}, false, "Order not found"));
          return;
        }
        order.paymentMethod = pageOpt.paymentMethod || null;
        await order.save();
        resolve(new CommonResponseDto(order.get({ plain: true }), true, "Payment method updated"));
      } catch (err) {
        console.log("err = = = >", err);
        resolve(new CommonResponseDto([], false, "Something Went Wrong"));
      }
    });
  }

  async syncOrders(body: OrderDto) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await OrderMaster.sequelize.transaction(
          async (transaction: Transaction) => {
            let contactMaster: ContactMaster;
            const user = await User.findByPk(body?.userId);
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
            let order_id = Math.round(+new Date() / 10);
            const { orderItems } = body;
            let obj = {
              orderId: order_id,
              adminId: body?.userId,
              companyId: body?.companyId,
              staffId: body?.staffId,
              shift_id: body?.shift_id,
              utcOffset: body?.utcOffset,
              total: body?.total,
              ac_room: body?.ac_room,
              cooking_instructions: body?.cooking_instructions,
              paymentMethod: body?.paymentMethod || null,
              tokenNo: body?.tokenNo,
              orderStatus: body?.orderStatus,
            };
            if (body?.table_details) {
              obj["table_id"] = Number(body?.table_details?.id);
            }
            const order = await OrderMaster.create(obj, { transaction });
            let orderItemsSaved: OrderItemDto[] = [];
            for (const item of orderItems) {
              const orderItemSaved = await this.orderItemsService.createByOrder(
                { ...item, companyId: body?.companyId },
                order.id,
                transaction
              );
              orderItemsSaved.push(orderItemSaved);
            }
            let result: any = {};
            result = {
              ...order.get({ plain: true }),
              orderItems: orderItemsSaved,
            };
            return result;
          }
        );
        let message = "Order Created Successfully";
        resolve(new CommonResponseDto(result, true, message));
      } catch (err) {
        console.log("err = = = >", err);
        let message = "Something Went Wrong in Our End....";
        resolve(new CommonResponseDto([], false, message));
      }
    });
  }
}
