import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  forwardRef,
} from "@nestjs/common";
import { AccountMaster } from "./account_master";
import { AccountMasterDto } from "./dto/account_masrter_dto";
import { PageDto, PageMetaDto, PageOptionsDto } from "../shared/dto";
import { User } from "../users/user.entity";
import { Op, Sequelize } from "sequelize";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { LedgerCategory } from "../ledger_category/ledger_category_model";
import { LedgerCategoryGroup } from "../ledger_category_group/ledger_category_group_model";
import { LedgerDetailsService } from "../ledger_details/ledger_details_service";
import { DatabaseService } from "../database/database.service";
import { CreateAccountDto } from "./dto/create_account_dto";
import uniqid from "uniqid";
import { ProductMasterService } from "../product_master/product_master_service";
import { ContactMasterService } from "../contactMaster/contactMasterService";
import { ReportService } from "../report/report.service";
import moment from "moment";
import { CompanyMasterService } from "../company_master/company_master_service";
import { ListAccountMasterDto } from "./dto/account_master_list";
import { OtherMasterService } from "../other_master/other_master.service";

@Injectable()
export class AccountMasterService {
  @Inject(LedgerDetailsService)
  private readonly ledger_details: LedgerDetailsService;

  @Inject(ProductMasterService)
  private readonly product_service: ProductMasterService;

  @Inject(ContactMasterService)
  private readonly contact_master: ContactMasterService;

  @Inject(forwardRef(() => ReportService))
  private readonly report_service: ReportService;

  @Inject(forwardRef(() => CompanyMasterService))
  private readonly company_service: CompanyMasterService;

  @Inject(OtherMasterService)
  private readonly otherMasterService: OtherMasterService

  constructor(
    @Inject("AccountMasterRepository")
    private readonly accountMasterRepository: typeof AccountMaster,
    private readonly databaseService: DatabaseService
  ) {}

  async getBankList(adminid, companyid) {
    let response: CommonResponseDto;
    try {
      let data = await this.accountMasterRepository.findAll({
        where: {
          adminid: adminid,
          companyid,
          category: 1,
          // laccount:{[Op.ne]:'Cash'}
        },
        order: [["id", "ASC"]],
      });
      if (data) {
        let bankList = [];
        let bankDetailsList = [];
        for (var i = 0; i < data.length; i++) {
          const currentBeforeDate = await this.ledger_details.findAllByQuery({
            where: {
              adminid: adminid,
              ledger: data[i]?.id,
              is_deleted: false,
            },
          });
          
          let openingBalance = 0;
          let Debit = currentBeforeDate.reduce((total: any, item: any) => {
            return total + Number(item.debit);
          }, 0);
    
          let Credit = currentBeforeDate.reduce((total: any, item: any) => {
            return total + Number(item.credit);
          }, 0)
          

          openingBalance = Number(Debit) - Number(Credit);
          let element = data[i];
          let opening = element.opening || 0;
          let result = await this.ledger_details.count({
            where: {
              ledger: element.id,
            },
          });
          let total = element.total || 0;
          let amount = 0;
          if (total) {
            amount = Number(opening) + Number(total);
          } else {
            amount = Number(opening);
          }
          let bank = {
            amount,
            delete: result || 0,
            list: element,
            openingBalance:openingBalance
          };
          bankDetailsList.push(element);
          bankList.push(bank);
        }
        if (data) {
          response = {
            status: true,
            message: "User Bank List",
            data: {
              bankList,
              list: bankDetailsList,
            },
          };
        } else {
          response = { status: false, message: "No data Found", data: [] };
        }
      }
    } catch (error) {
      console.log(error)
      throw error
    }
    return response;
  }

  async getAccountsOfAdmin(adminid, companyid) {
    let response: any;
    try {
      let data = await this.accountMasterRepository.findAll({
        where: {
          adminid: adminid,
          companyid,
        },
        order: [["id", "ASC"]],
      });
      response = data;
    } catch (error) {
      console.log(error)
      throw error
    }
    return response;
  }
  async getCashList(adminid, companyid) {
    let response: CommonResponseDto;
    try {
      let data = await this.accountMasterRepository.findAll({
        where: {
          adminid: adminid,
          companyid,
          laccount: "Cash",
        },
        order: [["id", "ASC"]],
      });
      if (data) {
        let bankList = [];
        let bankDetailsList = [];
        for (var i = 0; i < data.length; i++) {
          const currentBeforeDate = await this.ledger_details.findAllByQuery({
            where: {
              adminid: adminid,
              ledger: data[i]?.dataValues?.id,
              is_deleted: false,
            },
          });
          console.log('this is the ledger details', currentBeforeDate)
          let openingBalance = 0;
          let Debit = currentBeforeDate.reduce((total: any, item: any) => {
            return total + Number(item.debit);
          }, 0);
    
          let Credit = currentBeforeDate.reduce((total: any, item: any) => {
            return total + Number(item.credit);
          }, 0);
    
          openingBalance = Number(Debit) - Number(Credit);

          let element = data[i];
          let opening = element.opening || 0;
          let result = await this.ledger_details.count({
            where: {
              ledger: element.id,
            },
          });
          let total = element.total || 0;
          let amount = 0;
          if (total) {
            amount = Number(opening) + Number(total);
          } else {
            amount = Number(opening);
          }
          let bank = {
            amount,
            delete: result || 0,
            list: element,
            openingBalance:openingBalance
          };
          bankDetailsList.push(element);
          bankList.push(bank);
        }
        if (data) {
          response = {
            status: true,
            message: "User Bank List",
            data: {
              bankList,
              list: bankDetailsList,
            },
          };
        } else {
          response = { status: false, message: "No data Found", data: [] };
        }
      }
    } catch (error) {
      console.log(error)
      throw error
    }
    return response;
  }

  async getUserBankList(adminid) {
    let response: CommonResponseDto;
    try {
      let data = await this.accountMasterRepository.findAll({
        where: {
          adminid: adminid,
          type: 1,
        },
        order: [["id", "ASC"]],
      });

      if (data) {
        response = {
          status: true,
          message: "User Bank List",
          data,
        };
      } else {
        response = { status: false, message: "No data Found", data: [] };
      }
    } catch (error) {
      console.log(error)
      throw error
    }
    return response;
  }

  async addBankAccount(createBank: any) {
    let response: CommonResponseDto;
    try {
      const checkNominalCode = await this.accountMasterRepository.findOne({
        where: {
          adminid: createBank.adminid,
          nominalcode: createBank.nominalcode,
        },
      });
      if (checkNominalCode) {
        response = {
          data: null,
          status: false,
          message: "Nominal Code Exist Already",
        };
      } else {
        if (createBank.acctype == "savings" || createBank.acctype == "loan") {
          createBank.paidmethod = "electronic";
        } else if (
          createBank.acctype == "current" ||
          createBank.acctype == "card" ||
          createBank.acctype == "other"
        ) {
          createBank.paidmethod = "creditcard";
        } else {
          createBank.paidmethod = "cash";
        }
        let data: any = {
          acctype: createBank.acctype,
          laccount: createBank.laccount,
          branch: createBank.branch,
          ifsc: createBank.ifsc,
          accnum: createBank.accnum,
          cardnum: createBank.cardnum,
          userid: createBank.userid || createBank.adminid,
          adminid: createBank.adminid,
          nominalcode: createBank.nominalcode,
          paidmethod: createBank.paidmethod,
          sortcode1: createBank.sortcode1,
          sortcode2: createBank.sortcode2,
          sortcode3: createBank.sortcode3,
          ibannum: createBank.ibannum,
          bicnum: createBank.bicnum,
          opening: createBank.opening,
          userdate: new Date(createBank.userdate),
          sdate: new Date(createBank.userdate),
          type: "1",
          categorygroup: 1,
          category: 1,
          vissinvoice: "0",
          visbank: "1",
          vispinvoice: "0",
          visotherreceipt: "0",
          visotherpayment: "0",
          visjournal: "1",
          visreport: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: createBank.createdBy,
          accountname: createBank.accountname,
          companyid: createBank.companyid,
        };
        const addLedger = await this.accountMasterRepository.create(data);
        if (addLedger) {
                  
       let otherDataObj = {
          adminId:createBank.adminid,
          companyId:createBank.companyid,
          total:createBank.opening,
          ledgerId:addLedger.id,
          bankid:addLedger.id,
          createdBy:createBank.createdBy,
          date: createBank.sdate,
          type:"Opening Balance"
        };

        const otherData = await this.otherMasterService.create(otherDataObj);

          let balanceData = {
            otherid: "",
            credit: "0",
            debit: createBank.opening,
            total: createBank.opening,
            type: "Opening Balance",
            description: "Opening Balance",
            ledger: addLedger.id,
            ledgercategory: 1,
            adminid: createBank.adminid,
            baseid: "",
            bankid: addLedger.id,
            amount: createBank.opening,
            usertype: createBank.logintype,
            userdate: new Date(createBank.userdate),
            sdate: createBank.sdate,
            ldate: createBank.sdate,
            userid: createBank.userid,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: createBank.createdBy,
            companyid: createBank.companyid,
          };

          const result = await this.ledger_details.create(balanceData);



          const differenceOpeningLedger = await this.findAllByQuery({
            attributes: ['id', 'total'],
            where: {
              nominalcode: "999",
              userid: createBank.adminid
            },
          });

           if (differenceOpeningLedger.length) {
            let accountData = {
              total: Number(differenceOpeningLedger[0]?.total) + Number(createBank.opening)
            }
            const updateVatLedger = await this.update(
              differenceOpeningLedger[0]?.id,
              accountData,
            );
          }

          // let balanceData2: any = {
          //   otherid: result.id,
          //   debit: '0',
          //   credit: createBank.opening,
          //   total: createBank.opening,
          //   type: 'Opening Balance',
          //   description: 'Opening Balance',
          //   ledger: 70,
          //   ledgercategory: 7,
          //   adminid: createBank.adminid,
          //   bankid: addLedger.id,
          //   amount: createBank.opening,
          //   usertype: createBank.logintype,
          //   userdate: new Date(createBank.userdate),
          //   sdate: createBank.sdate,
          //   ldate: createBank.sdate,
          //   userid: createBank.userid,
          //   baseid: result.id,
          //   createdAt: new Date(),
          //   updatedAt: new Date(),
          // };

          // const result2 = await this.ledger_details.create(balanceData2);
          if (result) {
            response = {
              status: true,
              message: "Bank Information added Succesfully",
              data: addLedger,
            };
          } else {
            response = {
              status: false,
              message:
                "Bank Account Created but Failed to Create Banking Details",
              data: null,
            };
          }
        }
      }
    } catch (error) {
      console.log(error)
      throw error
    }
    return response;
  }

  async updateBankAccount(updateBank: any) {
    let response: CommonResponseDto;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          let data = {
            laccount: updateBank.laccount,
            acctype: updateBank.acctype,
            accountname:updateBank.accountname,
            branch: updateBank.branch,
            ifsc: updateBank.ifsc,
            accnum: updateBank.accnum,
            cardnum: updateBank.cardnum,
            nominalcode: updateBank.nominalcode,
            paidmethod: updateBank.paidmethod,
            sortcode1: updateBank.sortcode1,
            sortcode2: updateBank.sortcode2,
            sortcode3: updateBank.sortcode3,
            ibannum: updateBank.ibannum,
            bicnum: updateBank.bicnum,
            opening: updateBank.opening,
            adminid: updateBank.adminid,
            userdate: new Date(updateBank.userdate),
            createdBy: updateBank.createdBy,
            companyid: updateBank.companyid,
          };
          const updateLedger: any = await this.accountMasterRepository.update(
            data,
            {
              where: {
                adminid: updateBank.adminid,
                id: updateBank.id,
              },
            }
          );

          if (updateLedger) {

            const checkOpeningBank = await this.ledger_details.findOneByQuery({
              where: {
                type: "Opening Balance",
                ledger: updateBank.id,
                adminid: updateBank.adminid,
              },
            });
            if (checkOpeningBank) {
              const transactionId = checkOpeningBank.id;
              let deleted = this.ledger_details.distroy({
                where: {
                  id: transactionId,
                },
              });

              let otherDataObj = {
                adminId:updateBank.adminid,
                companyId:updateBank.companyid,
                total:updateBank.opening,
                ledgerId: updateBank.id,
                bankid: updateBank.id,
                createdBy:updateBank.createdBy,
                date: updateBank.sdate,
                type:"Opening Balance"
              };
      
              const otherData = await this.otherMasterService.update(Number(checkOpeningBank.otherid),otherDataObj);

              if (deleted) {

                let balanceData = {
                  credit: "0",
                  debit: updateBank.opening,
                  total: updateBank.opening,
                  type: "Opening Balance",
                  description: "Opening Balance",
                  ledger: updateBank.id,
                  ledgercategory: "1",
                  adminid: updateBank.adminid,
                  otherid:otherData.data.id,
                  baseid: "",
                  bankid: updateLedger.id,
                  amount: updateBank.opening,
                  usertype: updateBank.logintype,
                  userdate: new Date(),
                  sdate: updateBank.sdate,
                  ldate: updateBank.sdate,
                  userid: updateBank.userid,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  createdBy: updateBank.createdBy,
                  companyid: updateBank.companyid,
                };

                const result: any = await this.ledger_details.create(
                  balanceData,
                  transaction
                );

                const oldOpeningDifference = checkOpeningBank.amount;
                const differenceOpeningLedger = await this.findAllByQuery({
                  attributes: ['id', 'total'],
                  where: {
                    nominalcode: "999",
                    userid: updateBank.adminid
                  },
                });
      
                 if (differenceOpeningLedger.length) {
                  let accountData = {
                    total: Number(differenceOpeningLedger[0]?.total) + Number(updateBank.opening) - Number(oldOpeningDifference)
                  }
                  const updatedLedgerData = await this.update(
                    differenceOpeningLedger[0]?.id,
                    accountData,
                  );
                }

                if (result) {
                  response = {
                    status: true,
                    message: "Bank Information added Succesfully",
                    data: result,
                  };
                } else {
                  response = {
                    status: false,
                    message:
                      "Bank Account Created but Failed to Create Banking Details",
                    data: result,
                  };
                }
              } else {
                response = {
                  status: true,
                  message: "Bank Update but Opening Balance Not updated",
                  data: [],
                };
              }
            } else {
              let otherDataObj = {
                adminId:updateBank.adminid,
                companyId:updateBank.companyid,
                total:updateBank.opening,
                ledgerId: updateBank.id,
                bankid: updateBank.id,
                createdBy:updateBank.createdBy,
                date: updateBank.sdate,
                type:"Opening Balance"
              };
      
              const otherData = await this.otherMasterService.create(otherDataObj);
              
              let balanceData = {
                credit: "0",
                debit: updateBank.opening,
                total: updateBank.opening,
                type: "Opening Balance",
                description: "Opening Balance",
                ledger: updateBank.id,
                ledgercategory: "1",
                adminid: updateBank.adminid,
                baseid: "",
                bankid: updateBank.id,
                amount: updateBank.opening,
                otherid:otherData.data.id,
                usertype: updateBank.logintype,
                userdate: new Date(),
                sdate: updateBank.sdate,
                ldate: updateBank.sdate,
                userid: updateBank.userid,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: updateBank.createdBy,
              };

              const result = await this.ledger_details.create(
                balanceData,
                transaction
              );

              const differenceOpeningLedger = await this.findAllByQuery({
                attributes: ['id', 'total'],
                where: {
                  nominalcode: "999",
                  userid: updateBank.adminid
                },
              });
    
               if (differenceOpeningLedger.length) {
                let accountData = {
                  total: Number(differenceOpeningLedger[0]?.total) + Number(updateBank.opening)
                }
                const updateVatLedger = await this.update(
                  differenceOpeningLedger[0]?.id,
                  accountData,
                );
              }

              if (result) {
                response = {
                  status: true,
                  message: "Bank Information added Succesfully",
                  data: result,
                };
              }
            }
          } else {
            response = {
              status: false,
              message: "Error Updating Banking Information",
              data: [],
            };
          }
        }
      );
    } catch (error) {
      console.log(error)
      throw error
    }
    return response;
  }

  async findAllSaleList(adminid) {
    try {
      const data = await this.accountMasterRepository.findAll<AccountMaster>({
        include: [
          {
            model: LedgerCategory,
          },
          {
            model: LedgerCategoryGroup,
          },
        ],
        where: {
          userid: {
            [Op.or]: [-2],
          },
          category: {
            [Op.or]: [13, 11],
          },
          type: {
            [Op.ne]: 1,
          },
          adminid: {
            [Op.or]: ["", adminid],
          },
        },
      });
      return new CommonResponseDto(
        data.map((tmp) => new AccountMasterDto(tmp)),
        true,
        "Ledger Accounts List"
      );
    } catch (error) {
      console.log(error)
      throw error
    }
    
  }

  async defaultLedgers() {
    let response: CommonResponseDto;
    try {
      let ledgerDetails =
        await this.accountMasterRepository.findAll<AccountMaster>({
          where: {
            userid: "-2",
          },
          include: [
            {
              model: LedgerCategory,
            },
            {
              model: LedgerCategoryGroup,
            },
          ],
        });
      response = {
        status: true,
        message: "Default Ledgers List",
        data: ledgerDetails,
      };
    } catch (err) {
      console.log(err)
      throw err
    }
    return response;
  }

  async findExpenseLedgers(adminid:number,companyid:number){
    try {
      const expenseLedgers =
      await this.accountMasterRepository.findAll<AccountMaster>({
        where: {
          adminid: adminid,
          companyid:companyid,
          categorygroup:3
        },
        include: [
          {
            model: LedgerCategory,
          },
          {
            model: LedgerCategoryGroup,
          },
        ],
      });

      return new CommonResponseDto(expenseLedgers,true, "Expense ledgers list fetched successfully")
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async listAccountMaster(body: ListAccountMasterDto) {
    return new Promise(async (resolve, reject) => {
      try {
        var whereCase: any = {};
        var queryCondition = {};

        if (body.adminId) {
          whereCase = {
            adminid: body?.adminId,
            companyid: body?.companyId,
            type: {
              [Op.ne]: 1,
            },
          };
        } else {
          whereCase = {
            userid: -2,
          };
        }
        if (body?.query) {
          const searchQuery = body.query.toLowerCase();
          const items = ["laccount", "nominalcode"].map((item) => {
            return Sequelize.where(
              Sequelize.fn("LOWER", Sequelize.col(item)),
              "LIKE",
              `%${searchQuery}%`
            );
          });
          queryCondition = { [Op.or]: items };
        }
        if (body?.sDate) {
          whereCase["createdat"] = {
            [Op.between]: [
              moment(body?.sDate).startOf("day").toDate(),
              moment(body?.lDate).endOf("day").toDate(),
            ],
          };
        }
        whereCase = { ...whereCase, ...queryCondition };
        var Total: any = await AccountMaster.count({ where: whereCase });
        let datas = await AccountMaster.findAll({
          where: whereCase,
          include: [
            {
              model: LedgerCategory,
            },
            {
              model: LedgerCategoryGroup,
            },
          ],
          offset: (body?.page - 1) * body?.take,
          limit: body?.take,
          order: [["id", "DESC"]],
        });
        let meta = {
          page: body?.page,
          take: body?.take,
          totalCount: Total,
        };
        let success = {
          datas,
          Total,
          meta,
          status: true,
          message: "Ledgers List",
        };
        resolve(success);
      } catch (err) {
        console.log(err)
        throw err
        // let meta = {
        //   page: body?.page,
        //   take: body?.take,
        //   totalCount: 0,
        // };
        // let error = {
        //   datas: [],
        //   Total: 0,
        //   meta,
        //   status: true,
        //   message: "Ledgers List",
        // };
        // reject(error);
      }
    });
  }

  async findAllList(adminid) {
    try {
      const data = await this.accountMasterRepository.findAll<AccountMaster>({
        include: [
          {
            model: LedgerCategory,
          },
          {
            model: LedgerCategoryGroup,
          },
        ],
        where: {
          [Op.or]: [
            {
              userid: {
                [Op.or]: [-2],
              },
            },
            {
              adminid: {
                [Op.or]: [adminid],
              },
            },
          ],
  
          type: {
            [Op.ne]: 1,
          },
        },
      });
      return new CommonResponseDto(
        data.map((tmp) => new AccountMasterDto(tmp)),
        true,
        "Ledger Accounts List"
      );
    } catch (error) {
      console.log(error)
      throw error
    }
    
  }

  async getMyLedgers(adminid, companyid) {
    try {
      const data = await this.accountMasterRepository.findAll<AccountMaster>({
        include: [
          {
            model: LedgerCategory,
          },
          {
            model: LedgerCategoryGroup,
          },
        ],
        where: {
          type: {
            [Op.ne]: 1,
          },
          adminid: adminid,
          companyid,
        },
      });
      return new CommonResponseDto(data, true, "Ledger Accounts List");
    } catch (error) {
      console.log(error)
      throw error
    }
    
  }

  async findAllPurchaseList(adminid) {
    try {
      const data = await this.accountMasterRepository.findAll<AccountMaster>({
        include: [
          {
            model: User,
            attributes: ["id"],
          },
        ],
        where: {
          type: {
            [Op.not]: { [Op.or]: [1, 5] },
          },
          userid: {
            [Op.or]: [-2],
          },
          vispinvoice: {
            [Op.ne]: 0,
          },
          adminid: {
            [Op.or]: ["", adminid],
          },
        },
      });
  
      return new CommonResponseDto(
        data.map((tmp) => new AccountMasterDto(tmp)),
        true,
        "Purchase ledger List"
      );
    } catch (error) {
      console.log(error)
      throw error
    }
    
  }
  async findAll(pageOptionsDto: PageOptionsDto) {
    try {
      const skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
    const exp =
      await this.accountMasterRepository.findAndCountAll<AccountMaster>({
        include: [
          {
            model: User,
            attributes: ["id"],
          },
        ],
        where: {},
        limit: pageOptionsDto.take,
        offset: skip,
        order: [["userid", pageOptionsDto.order]],
      });

    const entities = exp.rows.map((ctry) => new AccountMasterDto(ctry));
    const itemCount = exp.count;

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
    return new PageDto(entities, pageMetaDto);
    } catch (error) {
      console.log(error)
      throw error
    }
    
  }

  async getPayHead(
    pageOptionsDto: PageOptionsDto,
    companyid: number,
    name: string
  ) {
    try {
      const skip =
      (Number(pageOptionsDto.page) - 1) * Number(pageOptionsDto.take);
    let whereCase = { type: 5, companyid: companyid };
    if (name) {
      whereCase["laccount"] = name;
    }

    const exp =
      await this.accountMasterRepository.findAndCountAll<AccountMaster>({
        include: [LedgerCategory, LedgerCategoryGroup],
        where: whereCase,
        limit: Number(pageOptionsDto.take),
        offset: skip,
        order: [["id", pageOptionsDto.order]],
      });

    const entities = exp.rows;
    const itemCount = exp.count;

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
    return new PageDto(entities, pageMetaDto);
    } catch (error) {
      console.log(error)
      throw error
    }
   
  }

  async findAllByQuery(query: any) {
    try {
      const data = await this.accountMasterRepository.findAll<AccountMaster>(
        query
      );
      if (!data) {
        throw new HttpException({ message: "No ledger found" }, HttpStatus.OK);
      }
      return data.map((tmp) => new AccountMasterDto(tmp));
    } catch (error) {
      console.log(error);
      throw error
    }
  }

  async getAllPayheads(companyid: any) {
    try {
      const payHeads = await this.accountMasterRepository.findAll({
        where: {
          companyid,
          acctype:"payroll"
        },
        include: [LedgerCategory, LedgerCategoryGroup],
      });
      if (payHeads) {
        return new CommonResponseDto(
          payHeads,
          true,
          "pay heads fetched successfully"
        );
      } else {
        return new CommonResponseDto(null, false, "failed to fetch pay heads");
      }
    } catch (error) {
      console.log(error);
      throw error
    }
  }

  async findOne(id: number) {
    try {
      const cust = await this.accountMasterRepository.findByPk<AccountMaster>(
        id,
        {
          include: [
            {
              model: LedgerCategory,
              as: "categoryDetails",
            },
            {
              model: LedgerCategoryGroup,
              as: "groupDetails",
            },
          ],
        }
      );
      if (!cust) {
        throw new HttpException("No ledger found", HttpStatus.NOT_FOUND);
      }
      return new CommonResponseDto(cust, true, "Ledger Details");
    } catch (error) {
      console.log(error);
      throw error
    }
  }

  async findByQuery(id: number, query: any) {
    try {
      const cust = await this.accountMasterRepository.findByPk<AccountMaster>(
        id,
        query
      );
      if (!cust) {
        throw new HttpException("No awb customer found", HttpStatus.NOT_FOUND);
      }
      return new AccountMasterDto(cust);
    } catch (error) {
      console.log(error)
      throw error
    }
  
  }

  async findQuery(id: number, query: any) {
    try {
      const cust = await this.accountMasterRepository.findByPk<AccountMaster>(
        id,
        query
      );
      if (!cust) {
        return {};
      }
      return new AccountMasterDto(cust);
    } catch (error) {
      console.log(error)
      throw error
    }

  }
  async findOneQuery(id: number) {
    try {
      const cust = await this.accountMasterRepository.findByPk<AccountMaster>(id);
      if (!cust) {
        return {};
      }
      return new AccountMasterDto(cust);
    } catch (error) {
      console.log(error)
      throw error
    }

  }

  async findById(id: number) {
    try {
      const cust = await this.accountMasterRepository.findByPk<AccountMaster>(
        id,
        {}
      );
      if (!cust) {
        throw new HttpException("No ledger found", HttpStatus.NOT_FOUND);
      }
      return cust;
    } catch (error) {
      console.log(error)
      throw error
    }
  
  }

  async create(dto: CreateAccountDto) {
    let date = new Date().toString();
    let obj: any = {
      itemtype: "fixed assets",
      icode: uniqid(),
      idescription: dto.laccount,
      price: 0,
      sp_price: 0,
      rate: 0,
      costprice: 0,
      quantity: 1,
      date: new Date(),
      c_price: 0,
      rquantity: 0,
      type: 1,
      userdate: date,
      logintype: "user",
      id: "create",
      userid: dto.userid,
      adminid: dto.adminid,
      existingstock: false,
      product_category: "cabinet",
      unit: "NOS",
    };
    if (dto.category === 8) {
      let obj_ = await this.product_service.create(obj);
    }
    try {
      const cust = new AccountMaster();
      let checkNominalCode
      if (dto.nominalcode) {
        checkNominalCode = await this.accountMasterRepository.findOne({
          where: {
            adminid: dto.adminid,
            nominalcode: dto.nominalcode,
            companyid: dto.companyid,
          },
        });
      }
      const checklaccount = await this.accountMasterRepository.findOne({
        where: {
          adminid: dto.adminid,
          laccount: dto.laccount,
          companyid: dto.companyid,
        },
      });

      if (checkNominalCode) {
        return new CommonResponseDto(null, false, "Nominal Code Already Exist");
      } else if (checklaccount) {
        return new CommonResponseDto(
          null,
          false,
          "Ledger Account Already Exist"
        );
      }

      cust.type = 0;
      if (dto.category == 11 || dto.category == 13) {
        cust.vissinvoice = 1;
        cust.visbank = 0;
        cust.vispinvoice = 0;
        cust.visotherreceipt = 1;
        cust.visotherpayment = 0;
        cust.visjournal = 1;
        cust.visreport = 1;
      } else if (dto.category == 6 || dto.category == 5 || dto.category == 12) {
        cust.vissinvoice = 0;
        cust.visbank = 0;
        cust.vispinvoice = 1;
        cust.visotherreceipt = 0;
        cust.visotherpayment = 1;
        cust.visjournal = 1;
        cust.visreport = 1;
      } else if (dto.category == 1) {
        cust.vissinvoice = 0;
        cust.visbank = 1;
        cust.vispinvoice = 0;
        cust.visotherreceipt = 0;
        cust.visotherpayment = 0;
        cust.visjournal = 1;
        cust.visreport = 1;
        cust.vispayroll = 0;
      } else if (dto?.acctype == "payroll") {
        cust.vispayroll = 1;
      } else {
        cust.vissinvoice = 0;
        cust.visbank = 0;
        cust.vispinvoice = 0;
        cust.visotherreceipt = 0;
        cust.visotherpayment = 1;
        cust.visjournal = 1;
        cust.visreport = 1;
      }
      cust.nominalcode = dto.nominalcode;
      cust.laccount = dto.laccount;
      cust.category = dto.category;
      cust.categorygroup = dto.categorygroup;
      cust.userid = dto.userid;
      cust.type = dto.type;
      cust.payheadType = dto?.payheadType || null;
      cust.calculationPeriod = dto?.calculationPeriod || null;
      cust.acctype = dto?.acctype || null;
      cust.adminid = dto.adminid;
      const cust_ = cust;
      cust_.journals = "null";
      cust_.Purchase = "null";
      cust_.Sales = "null";
      cust.createdBy = dto.createdBy;
      cust.companyid = dto.companyid;

      const saveData = await cust_.save();

      return new CommonResponseDto(saveData, true, "New Ledger created");
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async update(id: number, dto: any, transaction?: any) {
    try {
      const cust = await this.findById(id);
      cust.nominalcode = dto.nominalcode || cust.nominalcode;
      cust.laccount = dto.laccount || cust.laccount;
      cust.category = dto.category || cust.category;
      cust.categorygroup = dto.categorygroup || cust.categorygroup;
      cust.acctype = dto.acctype || cust.acctype;
      cust.userid = dto.userid || cust.userid;
      cust.accnum = dto.accnum || cust.accnum;
      cust.cardnum = dto.cardnum || cust.cardnum;
      cust.paidmethod = dto.paidmethod || cust.paidmethod;
      cust.sortcode1 = dto.sortcode1 || cust.sortcode1;
      cust.sortcode2 = dto.sortcode2 || cust.sortcode2;
      cust.sortcode3 = dto.sortcode3 || cust.sortcode3;
      cust.ibannum = dto.ibannum || cust.ibannum;
      cust.bicnum = dto.bicnum || cust.bicnum;
      cust.opening = dto.opening || cust.opening;
      cust.total = dto.total === 0 ? dto.total : dto.total || cust.total;
      cust.userdate = dto.userdate || cust.userdate;
      cust.type = dto.type || cust.type;
      cust.adminid = dto.adminid || cust.adminid;
      cust.visiblestatus = dto.visiblestatus || cust.visiblestatus;
      cust.visbank = dto.visbank || cust.visbank;
      cust.vissinvoice = dto.vissinvoice || cust.vissinvoice;
      cust.vispinvoice = dto.vispinvoice || cust.vispinvoice;
      cust.visotherreceipt = dto.visotherreceipt || cust.visotherreceipt;
      cust.visotherpayment = dto.visotherpayment || cust.visotherpayment;
      cust.visjournal = dto.visjournal || cust.visjournal;
      cust.visreport = dto.visreport || cust.visreport;
      cust.showVatRate = dto.showVatRate || cust.showVatRate;
      cust.payheadType = dto.payheadType || cust.payheadType;
      cust.journals =
        dto.journals === 0 ? "null" : dto.journals || cust.journals;
      cust.Purchase =
        dto.purchase === 0 ? "null" : dto.purchase || cust.Purchase;
      cust.Sales = dto.sales === 0 ? "null" : dto.sales || cust.Sales;
      cust.calculationPeriod = dto.calculationPeriod || cust.calculationPeriod;
      cust.createdBy = dto.createdBy || cust.createdBy;
      cust.companyid = dto.companyid || cust.companyid;

      let saveData = await cust.save({ transaction });
      return new CommonResponseDto(saveData, true, "Ledger Updated");
    } catch (ex) {
      console.log("ex", ex);
      throw ex
    }
  }

  async delete(id: number) {
    try {
      const cust = await this.findById(id);
      await cust.destroy();
      return cust;
    } catch (error) {
      console.log(error)
      throw error
    }

  }

  async findAllListType(id: number, type: string): Promise<CommonResponseDto> {
    try {
      const defaultLedgers = await this.queryLedgers("-2", type);
      const userLedgers = await this.queryLedgers(id.toString(), type);
      const combinedLedgers = [...defaultLedgers, ...userLedgers];
      return {
        status: true,
        message: "Default Ledgers List",
        data: combinedLedgers,
      };
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async updateVisibility(body: any) {
    try {
      const cust = await this.findById(body.id);
      cust.journals = body.journals ? body.journals || cust.journals : null;
      cust.Purchase = body.purchase ? body.purchase || cust.Purchase : null;
      cust.Sales = body.sales ? body.sales || cust.Sales : null;
      let saveData = await cust.save();
      return new CommonResponseDto(saveData, true, "Ledger Updated");
    } catch (err) {
      console.log("err", err);
      throw err
    }
  }

  async queryLedgers(userid: string, type: string): Promise<AccountMaster[]> {
    try {
      const conditions = {
        userid: userid,
        [type]: type,
      };
      return this.accountMasterRepository.findAll<AccountMaster>({
        where: conditions,
        include: [{ model: LedgerCategory }, { model: LedgerCategoryGroup }],
      });
    } catch (error) {
      console.log(error)
      throw error
    }
 
  }

  async findAllFixedAssets(adminid) {
    let response: any = {};
    try {
      let ledgerDetails =
        await this.accountMasterRepository.findAll<AccountMaster>({
          where: {
            userid: ["-2", adminid],
            category: 8,
          },
          include: [
            {
              model: LedgerCategory,
            },
            {
              model: LedgerCategoryGroup,
            },
          ],
        });
      response = {
        status: false,
        message: "Fixed Assets Ledger List",
        data: ledgerDetails,
      };
    } catch (error) {
     console.log(error)
     throw error
    }
    return response;
  }

}
