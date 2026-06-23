import { Injectable } from "@nestjs/common";
import { Op, Sequelize } from "sequelize";
import { CompanyMaster } from "../company_master/company_master_entity";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { StaffTransactions } from "../staff_transactions/staff_transactions_entity";
import { CreateRetailCustomerDto } from "./dto/retail_customer_create";
import { RetailCustomerEntity } from "./retail_customer_entity";

@Injectable()
export class RetailCustomerService {
  constructor() {}
  async create(body: CreateRetailCustomerDto, userId: any) {
    try {
      const { email, card_number, companyid, refferalCode } = body;

      // Check if customer already exists
      const existingCustomer =
        await RetailCustomerEntity.findOne<RetailCustomerEntity>({
          where: {
            card_number: card_number,
            adminid: userId,
            companyid,
          },
        });

      if (existingCustomer) {
        return new CommonResponseDto(
          null,
          false,
          "Customer already existing !"
        );
      }

      let refferalCustomerId: any = null;

      // Handle referral code logic
      if (refferalCode) {
        const customerDetails = await RetailCustomerEntity.findOne({
          where: {
            card_number: refferalCode,
            adminid: userId,
            companyid: companyid,
          },
        });

        if (customerDetails) {
          refferalCustomerId = customerDetails.id;

          const companyDetails = await CompanyMaster.findOne({
            where: { adminid: userId, id: companyid },
          });

          if (companyDetails) {
            const referralPoint =
              Number(customerDetails.refferalPoint) +
              Number(companyDetails.referralPoint);
            await this.update(refferalCustomerId, userId, {
              refferalPoint: referralPoint,
            });
          }
        } else {
          return new CommonResponseDto(null, false, "Invalid referral code!");
        }
      }

      // Create new customer
      const newCustomer = new RetailCustomerEntity({
        adminid: userId,
        companyid,
        card_number,
        phonenumber: body.phonenumber,
        outstanding: 0,
        email,
        name: body.name,
        status: body.status,
        refferalId: refferalCustomerId,
        refferalPoint: 0,
        loyaltyPoint: 0,
      });

      const savedCustomer = await newCustomer.save();

      return new CommonResponseDto(
        savedCustomer,
        true,
        "Customer created successfully."
      );
    } catch (err) {
      console.error(err);
      return new CommonResponseDto(
        null,
        false,
        "An error occurred while creating the customer."
      );
    }
  }

  async findAllByAdminid(body: any, userId: number) {
    try {
      let meta = {
        page: body?.page,
        take: body?.take,
        total: 0,
      };
      let whereCondition: any = {
        adminid: userId,
        companyid: body.companyid,
      };
      var queryCondition = {};

      if (body.status || body.status == 0) {
        whereCondition["status"] = body.status;
      }
      if (body?.query) {
        const searchQuery = body.query.toLowerCase();
        const items = ["email", "phonenumber", "name", "card_number"].map(
          (item) => {
            return Sequelize.where(
              Sequelize.fn("LOWER", Sequelize.col(item)),
              "LIKE",
              `%${searchQuery}%`
            );
          }
        );
        queryCondition = { [Op.or]: items };
      }
      var Total: any = await RetailCustomerEntity.count({
        where: whereCondition,
      });

      whereCondition = { ...whereCondition, ...queryCondition };
      let data: any = await RetailCustomerEntity.findAll({
        where: whereCondition,
        offset: (body?.page - 1) * body?.take,
        limit: body?.take,
        order: [["id", "DESC"]],
        raw: true,
      });
      data = data.map((item: any) => {
        const totalpoint = item?.refferalPoint + item?.loyaltyPoint;
        item["totalpoint"] = parseFloat(totalpoint.toFixed(2));
        return item;
      });

      meta.total = Total;
      return {
        data: data,
        meta,
        status: true,
        message: "Customer List",
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async findOne(id: number, adminid: number) {
    try {
      const retailCustomer =
        await RetailCustomerEntity.findOne<RetailCustomerEntity>({
          where: {
            id,
            adminid,
          },
        });
      if (!retailCustomer) {
        return new CommonResponseDto("", false, "Customer Not found");
      }
      return { data: retailCustomer, status: true, message: "success" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async update(id: number, userId: number, body: any) {
    try {
      const retailCustomer =
        await RetailCustomerEntity.findOne<RetailCustomerEntity>({
          where: {
            id: id,
            adminid: userId,
          },
        });
      if (retailCustomer) {
        retailCustomer.phonenumber =
          body.phonenumber || retailCustomer.phonenumber;
        retailCustomer.outstanding =
          body.outstanding || retailCustomer.outstanding;
        retailCustomer.email = body.email || retailCustomer.email;
        retailCustomer.name = body.name || retailCustomer.name;
        retailCustomer.status = body.status || retailCustomer.status;
        retailCustomer.refferalPoint =
          body?.refferalPoint || retailCustomer.refferalPoint;
        retailCustomer.loyaltyPoint = retailCustomer.loyaltyPoint;
        let data = await retailCustomer.save();
        return { data: data, status: true, message: "sucessfully Updated" };
      } else {
        return {
          data: {},
          status: false,
          message: "Customer not found",
        };
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async updateOutstanding(id: number, userId: number, body: any) {
    try {
      const retailCustomer =
        await RetailCustomerEntity.findOne<RetailCustomerEntity>({
          where: {
            id,
            adminid: userId,
          },
        });
      let outstanding: any;
      if (body?.type) {
        outstanding = retailCustomer.outstanding + body?.outstanding;
      } else {
        outstanding = retailCustomer.outstanding - body?.outstanding;
      }
      if (retailCustomer) {
        retailCustomer.outstanding = outstanding || retailCustomer.outstanding;

        let data = await retailCustomer.save();
        return { data: data, status: true, message: "sucessfully Updated" };
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async updateLoyaltyPoint(
    id: number,
    userId: number,
    totalAmount: number,
    companyId: number
  ) {
    try {
      const companyDetails = await CompanyMaster.findOne({
        where: { adminid: userId, id: companyId },
      });

      if (!companyDetails) {
        return { data: {}, status: false, message: "Company not found" };
      }

      const loyaltyPoint =
        (Number(companyDetails.loyaltyDiscountPercentage) / 100) *
        Number(totalAmount);

      const retailCustomer = await RetailCustomerEntity.findOne({
        where: { id, adminid: userId },
      });

      if (!retailCustomer) {
        return { data: {}, status: false, message: "Customer not found" };
      }

      retailCustomer.loyaltyPoint += parseFloat(loyaltyPoint.toFixed(2));
      await retailCustomer.save();

      return new CommonResponseDto(
        "",
        true,
        "Loyalty point added successfully"
      );
    } catch (err) {
      throw err;
    }
  }

  async climePointUse(body: any) {
    const retailCustomer: any =
      await RetailCustomerEntity.findOne<RetailCustomerEntity>({
        where: {
          id: body.id,
          adminid: body.adminid,
        },
      });
    let minusRefferal = retailCustomer.refferalPoint - body.redeem;
    let minusRefferalPoint = minusRefferal < 0 ? 0 : minusRefferal;
    let minsLoyalty;
    if (minusRefferal < 0) {
      let positive_value = Math.abs(minusRefferal);
      minsLoyalty = retailCustomer.loyaltyPoint - Number(positive_value);
    }
    (retailCustomer.refferalPoint = parseFloat(minusRefferalPoint?.toFixed(2))),
      (retailCustomer.loyaltyPoint = parseFloat(minsLoyalty?.toFixed(2)));
    await retailCustomer.save();
  }

  async findAll(adminid: number, companyid: number) {
    try {
      const retailCustomer = await RetailCustomerEntity.findAll({
        where: {
          adminid,
          companyid,
        },
      });
      return new CommonResponseDto(retailCustomer, true, "success");
    } catch (error) {
      throw error;
    }
  }

  async getRetailCustomerInvoices(adminid, companyid, customerid) {
    try {
      const customerInvoices = await StaffTransactions.findAll({
        where: {
          companyid,
          adminid,
          customerid,
          outstanding: {
            [Op.gt]: 0,
          },
        },
      });

      if (customerInvoices.length > 0) {
        return new CommonResponseDto(customerInvoices, true, "success");
      } else {
        return new CommonResponseDto(
          [],
          true,
          "No outstanding amount invoice found !"
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
