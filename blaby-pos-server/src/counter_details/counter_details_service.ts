import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import moment from "moment";
import { Op, Sequelize } from "sequelize";
import { BillingCounter } from "../billing_counter/billing_counter_entity";
import { BillingCounterService } from "../billing_counter/billing_counter_service";
import { ContactMaster } from "../contactMaster/contactMasterModel";
import { StaffTransactionsService } from "../staff_transactions/staff_transactions_service";
import { CounterDetails } from "./counter_details_entity";
import { ListCounterDetailsDto } from "./dto/counter_details.list-dto";
import { CounterDetailsDto } from "./dto/counter_details_dto";
import { UpdateDto } from "./dto/counter_details_update.dto";
import { CounterDetailsOpenShiftResponse } from "./dto/response.dto";
import { LocationMaster } from "../locations/location.entity";
import { Data } from "./dto/query.dto";

@Injectable()
export class CounterDetailsService {
  @Inject(forwardRef(() => BillingCounterService))
  private readonly billingCounterService: BillingCounterService;

  @Inject(forwardRef(() => StaffTransactionsService))
  private readonly staffTransactionsService: StaffTransactionsService;

  constructor(
    @Inject("CounterDetailsRepository")
    private readonly counterDetails: typeof CounterDetails
  ) {}

  async findAll() {
    try {
      const stafTransaction = await this.counterDetails.findAll<CounterDetails>(
        {}
      );
      return stafTransaction.map((item) => new CounterDetailsDto(item));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOne(id: number) {
    try {
      const counter = await this.counterDetails.findByPk<CounterDetails>(id);
      if (!counter) {
        throw new HttpException(
          "No counter Details found",
          HttpStatus.NOT_FOUND
        );
      }
      return counter;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findAllByAdminId(companyid: number) {
    try {
      const counters = await this.counterDetails.findAll<CounterDetails>({
        where: { companyid: companyid },
        include: [{ model: BillingCounter }],
      });
      return counters;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOneByQuery(query) {
    try {
      const counter = await this.counterDetails.findOne<CounterDetails>(query);
      if (!counter) {
        throw new HttpException(
          "No counter Details found",
          HttpStatus.NOT_FOUND
        );
      }
      return counter;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getCounterAssignAdmin(Dto: any) {
    try {
      const counter: any = await this.counterDetails.findOne<CounterDetails>({
        where: {
          staffid: Dto.staffid,
          adminid: Dto.adminId,
          companyid: Dto.companyid,
          sdate: {
            [Op.between]: [
              moment(Dto?.sDate).startOf("day").toDate(),
              moment(Dto?.sDate).endOf("day").toDate(),
            ],
          },
          open_denomination: {
            [Op.or]: [null, ""],
          },
        },
        include: [
          { model: ContactMaster },
          { model: BillingCounter, include: [{ model: LocationMaster }] },
        ],
      });

      if (!counter) {
        return {
          data: {},
          status: false,
          message: "No counter Details found",
        };
      }

      let shift: any = counter.counter.shiftlist.find((item: any) => {
        return item.name.toLowerCase() == counter.shift_type.toLowerCase();
      });

      let allData = {
        counter,
        shift: shift,
      };

      return {
        data: allData,
        status: true,
        message: "counter Detail",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async counterOpen(Dto: any) {
    try {
      const counter = await this.counterDetails.findOne<CounterDetails>({
        where: {
          staffid: Dto.staffid,
          adminid: Dto.adminId,
          companyid: Dto.companyid,
          // sdate: {
          //   [Op.between]: [
          //     moment(Dto?.sDate).startOf("day").toDate(),
          //     moment(Dto?.sDate).endOf("day").toDate(),
          //   ],
          // },
          open_denomination: {
            [Op.not]: "",
          },
          close_denomination: {
            [Op.or]: [null, ""],
          },
        },
        include: [
          { model: BillingCounter, include: [{ model: LocationMaster }] },
        ],
      });

      if (!counter) {
        return {
          data: {},
          status: false,
          message: "No counter details found",
        };
      }

      return {
        data: counter,
        status: true,
        message: "Counter detail",
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async openshift(createInvoice) {
    try {
      if (createInvoice?.sole_trader) {
        let counter: any = await this?.counterDetails?.findOne<CounterDetails>({
          where: {
            adminid: createInvoice?.adminid,
            companyid: createInvoice?.companyid,
            staffid: createInvoice?.staffid,
          },
          order: [["createdAt", "DESC"]],
          limit: 1,
        });
        counter = counter.get({ plain: true });
        let counterDetails: any = await BillingCounter?.findOne({
          where: {
            adminid: createInvoice?.adminid,
            companyid: createInvoice?.companyid,
          },
        });
        counterDetails = counterDetails.get({ plain: true });
        const currentTime = new Date();
        counterDetails.denomination.time = formatAMPM(currentTime);
        let obj = {
          balance: counter?.balance,
          denomination: counter.open_denomination,
        };

        let CountersData = await this.billingCounterService.updateBlance(
          obj,
          counter?.counter_id
        );
        if (
          new Date(counter?.sdate)?.toDateString() ===
          new Date(createInvoice?.sdate)?.toDateString()
        ) {
          return {
            data: { ...counter, counter: CountersData },
            status: true,
            message: "Add Open Deatails successfully",
          };
        }
        const stafTransaction = new CounterDetails();
        stafTransaction.adminid = createInvoice?.adminid;
        stafTransaction.companyid = createInvoice?.companyid;
        stafTransaction.counter_id = counterDetails?.id;
        stafTransaction.balance = counter?.balance || 0;
        stafTransaction.sdate = createInvoice?.sdate;
        stafTransaction.open_denomination = counterDetails?.denomination;
        stafTransaction.shift_type =
          counterDetails?.shiftlist[0]?.name || "Day Shift";
        stafTransaction.staffid = createInvoice?.staffid;

        let savedData: any = await stafTransaction.save();
        savedData = savedData.get({
          plain: true,
        });
        return {
          data: { ...savedData, counter: CountersData },
          status: true,
          message: "Add Open Deatails successfully",
        };
      } else {
        const counter = await this.counterDetails.findOne<CounterDetails>({
          where: {
            adminid: createInvoice.adminid,
            companyid: createInvoice.companyid,
            shift_type: createInvoice?.shift_type,
            counter_id: createInvoice?.counter_id,
            sdate: {
              [Op.between]: [
                moment(createInvoice?.sdate).startOf("day").toDate(),
                moment(createInvoice?.sdate).endOf("day").toDate(),
              ],
            },
          },
        });

        if (counter) {
          return {
            data: {},
            status: false,
            message: "Today this shift is already assigned.",
          };
        }

        const stafTransaction = new CounterDetails();
        stafTransaction.adminid = createInvoice?.adminid;
        stafTransaction.companyid = createInvoice?.companyid;
        stafTransaction.counter_id = createInvoice?.counter_id;
        stafTransaction.balance = createInvoice?.balance || 0;
        stafTransaction.sdate = createInvoice?.sdate;
        stafTransaction.open_denomination = createInvoice?.open_denomination;
        stafTransaction.shift_type = createInvoice?.shift_type;
        stafTransaction.staffid = createInvoice?.staffid;

        let obj = {
          balance: createInvoice?.balance,
          denomination: createInvoice.open_denomination,
        };

        let CountersData = await this.billingCounterService.updateBlance(
          obj,
          createInvoice?.counter_id
        );
        let savedData: any = await stafTransaction.save();
        savedData = savedData.get({
          plain: true,
        });

        return {
          data: { ...savedData, counter: CountersData },
          status: true,
          message: "Add Open Deatails successfully",
        };
      }
    } catch (error) {
      console.log(error, "------ error -----");
      throw error;
    }
  }

  async list(Dto: ListCounterDetailsDto) {
    try {
      var whereCase: any = {
        adminid: Dto?.adminId,
        counter_id: Dto?.counter_id,
      };
      var queryCondition = {};

      if (Dto?.query) {
        const searchQuery = Dto.query.toLowerCase();
        const items = ["shift_type"].map((item) => {
          return Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col(item)),
            "LIKE",
            `%${searchQuery}%`
          );
        });
        queryCondition = { [Op.or]: items };
      }
      if (Dto?.sDate) {
        whereCase["sdate"] = {
          [Op.between]: [
            moment(Dto?.sDate).startOf("day").toDate(),
            moment(Dto?.lDate).endOf("day").toDate(),
          ],
        };
      }

      whereCase = { ...whereCase, ...queryCondition };
      var Total: any = await CounterDetails.count({ where: whereCase });
      let data = await CounterDetails.findAll({
        where: whereCase,
        include: [{ model: ContactMaster }],
        offset: (Dto?.page - 1) * Dto?.take,
        limit: Dto?.take,
        order: [["id", "DESC"]],
      });
      let meta = {
        page: Dto?.page,
        take: Dto?.take,
        totalCount: Total,
      };
      let success = {
        data,
        Total,
        meta,
        status: true,
        message: "Staff  Transaction List",
      };
      return success;
    } catch (err) {
      console.log(err);
      throw err;
      // let error = {
      //   data: [],
      //   Total: 0,
      //   meta: { page: 0, take: 0, totalCount: 0 },
      //   status: true,
      //   message: "Staff  Transaction List",
      // };
    }
  }

  async closeshift(updateDto: UpdateDto) {
    try {
      const counterDetails: any = await this.findOneByQuery({
        where: {
          id: updateDto.id,
          companyid: updateDto.companyid,
        },
      });
      counterDetails.balance = updateDto.balance || counterDetails.balance;
      counterDetails.open_denomination =
        updateDto.open_denomination || counterDetails.open_denomination;
      counterDetails.close_denomination =
        updateDto.close_denomination || counterDetails.close_denomination;
      counterDetails.companyid =
        updateDto.companyid || counterDetails.companyid;
      counterDetails.closing_balance =
        updateDto.closing_balance || counterDetails.closing_balance;
      counterDetails.short = updateDto.short || counterDetails.short;

      let obj = {
        balance: updateDto?.balance,
        denomination:
          updateDto?.close_denomination || updateDto.open_denomination,
      };
      await this.billingCounterService.updateBlance(obj, updateDto?.counter_id);
      let data = await counterDetails.save();
      data = await counterDetails.reload({
        include: [
          {
            model: BillingCounter,
            include: [{ model: LocationMaster }],
          },
        ],
      });
      return {
        data: data,
        status: true,
        message: "Add Open Deatails successfully",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async listByShift(userId: number, Dto: any) {
    try {
      var whereCase: any = {
        adminid: userId,
        staffid: Dto?.staffid,
        companyid: Dto?.companyid,
      };

      var where: any = {
        adminid: userId,
        staffid: Dto?.staffid,
        companyid: Dto?.companyid,
      };

      if (Dto?.sDate) {
        whereCase["sdate"] = {
          [Op.between]: [
            moment(Dto?.sDate).startOf("day").toDate(),
            moment(Dto?.lDate).endOf("day").toDate(),
          ],
        };
      }

      var totalShift: any = await CounterDetails.count({ where: where });
      let totalInvoiceCount =
        await this.staffTransactionsService.totalInvoiceCount(where);
      var Total: any = await CounterDetails.count({ where: whereCase });
      let data = await CounterDetails.findAll({
        where: whereCase,
        include: [
          {
            model: BillingCounter,
            include: [{ model: LocationMaster }],
          },
        ],
        offset: (Dto?.page - 1) * Dto?.take,
        limit: Dto?.take,
        order: [["id", "DESC"]],
      });

      const shiftAdd = await Promise.all(
        data.map(async (item) => {
          const body = {
            adminid: item.adminid,
            companyid: item.companyid,
            shiftid: item.id,
            staffid: item.staffid,
          };
          const shift = await this.staffTransactionsService.listShiftData(body);
          return { ...item.toJSON(), ...shift };
        })
      );

      let meta = {
        page: Dto?.page,
        take: Dto?.take,
        totalCount: Total,
      };
      let success = {
        data: shiftAdd,
        totalShift,
        ...totalInvoiceCount,
        meta,
        status: true,
        message: "Staff Transaction List",
      };
      return success;
    } catch (error) {
      console.log("------- error ----", error);
      throw error;
    }
  }

  async clockInCounter(userId: number, data: Data) {
    try {
      const where = {
        adminid: userId,
        companyid: Number(data?.companyId),
        staffid: Number(data?.staffId),
      };
      const shift = await this.counterDetails.findOne({
        where: {
          ...where,
          open_denomination: {
            [Op.ne]: null,
          },
          close_denomination: null,
        },
        include: [
          {
            model: BillingCounter,
            required: true,
            as: "counter",
          },
        ],
      });
      if (!shift) {
        throw new NotFoundException("Shift is not available");
      }
      return {
        shift,
        status: true,
        message: "Shift details fetched successfully",
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error("Error in clockInCounter:", error);
      throw new InternalServerErrorException("Failed to fetch shift details");
    }
  }
  // async listByDate(userId: number, Dto: any) {
  //   try {
  //     var whereCase: any = {
  //       adminid: userId,
  //       staffid: Dto?.staffid,
  //       companyid: Dto?.companyid,
  //     };

  //     var where: any = {
  //       adminid: userId,
  //       staffid: Dto?.staffid,
  //       companyid: Dto?.companyid,
  //     };

  //     if (Dto?.sDate) {
  //       whereCase["sdate"] = {
  //         [Op.between]: [
  //           moment(Dto?.sDate).startOf("day").toDate(),
  //           moment(Dto?.sDate).endOf("day").toDate(),
  //         ],
  //       };
  //     }
  //     if (Dto?.sDate) {
  //       where["sdate"] = {
  //         [Op.between]: [
  //           moment(Dto?.sDate).startOf("day").toDate(),
  //           moment(Dto?.sDate).endOf("day").toDate(),
  //         ],
  //       };
  //     }
  //     let totalInvoiceCount =
  //       await this.staffTransactionsService.totalInvoiceCountByDate(where);
  //     var Total: any = await CounterDetails.count({ where: whereCase });
  //     let data = await CounterDetails.findAll({
  //       where: whereCase,
  //       include: [
  //         {
  //           model: BillingCounter,
  //           include: [{ model: LocationMaster }],
  //         },
  //       ],
  //       offset: (Dto?.page - 1) * Dto?.take,
  //       limit: Dto?.take,
  //       order: [["id", "DESC"]],
  //     });

  //     const shiftAdd = await Promise.all(
  //       data.map(async (item) => {
  //         const body = {
  //           adminid: item.adminid,
  //           companyid: item.companyid,
  //           shiftid: item.id,
  //           staffid: item.staffid,
  //         };
  //         const shift = await this.staffTransactionsService.listShiftData(body);
  //         return { ...item.toJSON(), ...shift };
  //       })
  //     );

  //     let meta = {
  //       page: Dto?.page,
  //       take: Dto?.take,
  //       totalCount: Total,
  //     };
  //     let success = {
  //       data: shiftAdd,
  //       ...totalInvoiceCount,
  //       meta,
  //       status: true,
  //       message: "Staff Transaction List",
  //     };
  //     return success;
  //   } catch (error) {
  //     console.log("------- error ----", error);
  //     throw error;
  //   }
  // }
}

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  const timeString = `${hours}:${minutes} ${ampm}`;
  return timeString;
}
