import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import moment from "moment";
import { Op, Sequelize } from "sequelize";
import { CounterDetailsService } from "../counter_details/counter_details_service";
import { BillingCounter } from "./billing_counter_entity";
import { ListBillingCounterDto } from "./dto/billing_counter.list-dto";
import { BillingCounterDto } from "./dto/billing_counter_dto";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { LocationMaster } from "../locations/location.entity";
import { Subscriptions } from "../subscriptions/subscriptions.entity";
import { ContactMaster } from "../contactMaster/contactMasterModel";

@Injectable()
export class BillingCounterService {
  @Inject(forwardRef(() => CounterDetailsService))
  private readonly counterDetailsService: CounterDetailsService;

  constructor(
    @Inject("BillingCounterRepository")
    private readonly billingCounter: typeof BillingCounter
  ) {}

  async findAll() {
    const stafTransaction = await this.billingCounter.findAll<BillingCounter>(
      {}
    );
    return stafTransaction.map((company) => new BillingCounterDto(company));
  }

  async findListByCompanyId(companyid: number) {
    try {
      const counterList = await this.billingCounter.findAll({
        where: {
          companyid: companyid,
        },
        include:[{
          model:LocationMaster
        }],
      });
      return new CommonResponseDto(
        counterList,
        true,
        "Counter list fetched successfully"
      );
    } catch (error) {
      console.log(error);
      throw error
    }
  }

  async getOne(id: number) {
    try {
      const company = await this.billingCounter.findByPk<BillingCounter>(id,{
       include:[{
          model:LocationMaster
        }],
      });
      if (!company) {
        throw new HttpException("No company found", HttpStatus.NOT_FOUND);
      }
      return company;
    } catch (error) {
      console.log(error)
      throw error
    }

  }

  async create(createInvoice) {
    try {
      const stafTransaction = new BillingCounter();
      stafTransaction.adminid = createInvoice?.adminid;
      stafTransaction.companyid = createInvoice?.companyid;
      stafTransaction.location = createInvoice?.location;
      stafTransaction.name = createInvoice?.name;
      stafTransaction.balance = createInvoice?.balance;
      stafTransaction.sdate = createInvoice?.sdate;
      stafTransaction.shiftlist = createInvoice?.shiftlist;
      let data = await stafTransaction.save();
      let subscription = await Subscriptions?.findOne({
        where:{
          userId:createInvoice?.adminid
        }
      })
      let staff = await ContactMaster?.findOne({
        where:{
          adminid:createInvoice?.adminid
        }
      })
      let counter_details
      if(subscription && staff){
        let datas = data.get({plain:true})
        subscription = subscription.get({plain:true})
        staff =  staff.get({plain:true})
        const time = formatAMPM(new Date())
        let denomination = {time:time, banknotes:[{count:0,denomination:0}], total_balance:0}
        if(subscription?.soleTrader){
          let obj = {
            adminid:createInvoice?.adminid,
            companyid:createInvoice?.companyid,
            counter_id:datas?.id,
            balance:0,
            sdate:createInvoice?.sdate,
            open_denomination:denomination,
            shift_type:datas?.shiftlist?.[0]?.name,
            staffid:staff?.id
          }
           counter_details = await this.counterDetailsService.openshift(obj)
        }
      }
      return { data, counter_details, status: true, message: "Counter created successfully" };
    } catch (error) {
      console.log(error, "------ error -----");
      throw error
    }
  }

  async list(data: ListBillingCounterDto) {
    return new Promise(async (resolve, reject) => {
      try {
        var whereCase: any = {
          adminid: data?.adminId,
          companyid: data?.companyid,
        };
        var queryCondition = {};

        if (data?.query) {
          const searchQuery = data.query.toLowerCase();
          const items = ["name"].map((item) => {
            return Sequelize.where(
              Sequelize.fn("LOWER", Sequelize.col(item)),
              "LIKE",
              `%${searchQuery}%`
            );
          });
          queryCondition = { [Op.or]: items };
        }
        if (data?.sDate) {
          whereCase["createdat"] = {
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
        var Total: any = await BillingCounter.count({ where: whereCase });
        let datas = await BillingCounter.findAll({
          where: whereCase,
          include:[{
            model:LocationMaster
          }],
          offset: (data?.page - 1) * data?.take,
          limit: data?.take,
          order: [["id", "DESC"]],
        });
        let meta = {
          page: data?.page,
          take: data?.take,
          totalCount: Total,
        };
        let success = {
          datas,
          Total,
          meta,
          status: true,
          message: "Staff  Transaction List",
        };
        resolve(success);
      } catch (err) {
        console.log(err);
        throw err
        // let meta = {
        //   page: data?.page,
        //   take: data?.take,
        //   totalCount: 0,
        // };
        // let error = {
        //   datas: [],
        //   Total: 0,
        //   meta,
        //   status: true,
        //   message: "Staff  Transaction List",
        // };
        // resolve(error);
      }
    });
  }

  async updateBlance(updateDto: any, id: any) {
    try {
      const counterDetails: any = await this.getOne(id);
      counterDetails.balance = updateDto.balance || counterDetails.balance;
      counterDetails.denomination =
        updateDto.denomination || counterDetails.denomination;
      let data = await counterDetails.save();
      return data;
    } catch (error) {
      console.log(error, "---------------- counterDetails");
      throw error
    }
  }

  async updateBlanceInvoice(id: any, balance: any) {
    try {
      const counterDetails: any = await this.getOne(id);
      const balanceTotal = Number(balance) + Number(counterDetails.balance) || 0
      counterDetails.balance = balanceTotal;
      let data = await counterDetails.save();
      return data;
    } catch (error) {
      console.log(error, "---------------- counterDetails");
      throw error
    }
  }

  async update(id: any, dto: any) {
    try {
      const counterDetails: any = await this.getOne(id);
      counterDetails.adminid = dto?.adminid || counterDetails.adminid;
      counterDetails.companyid = dto?.companyid || counterDetails.companyid;
      counterDetails.location = dto?.location || counterDetails.location;
      counterDetails.name = dto?.name || counterDetails.name;
      counterDetails.balance = dto?.balance || counterDetails.balance;
      counterDetails.sdate = dto?.sdate || counterDetails.sdate;
      counterDetails.shiftlist = dto?.shiftlist || counterDetails.shiftlist;
      let data = counterDetails.save();
      return { data, status: true, message: "Counter Update successfully" };
    } catch (error) {
      console.log(error)
      throw error
    }
  }
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
