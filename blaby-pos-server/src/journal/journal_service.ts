import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable
} from "@nestjs/common";
import { Journal } from "./journal_model";

import { JournalDto } from "./dto/journal_dto";

import { AccountMaster } from "../account_master/account_master";
import { AccountMasterService } from "../account_master/account_master_service";
import { ContactMasterService } from "../contactMaster/contactMasterService";
import { DatabaseService } from "../database/database.service";
import { LedgerDetailsService } from "../ledger_details/ledger_details_service";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { PageDto, PageMetaDto, PageOptionsDto } from "./../shared/dto";
import { UpdateJournalDto } from "./dto/journal_update_dto";
import { Op } from "sequelize";

@Injectable()
export class JournalService {
  @Inject(AccountMasterService)
  private readonly account_master: AccountMasterService;

  @Inject(LedgerDetailsService)
  private readonly ledger_details: LedgerDetailsService;

  @Inject(ContactMasterService)
  private readonly contact_details: ContactMasterService;

  constructor(
    @Inject("JournalRepository")
    private readonly cartRepository: typeof Journal,
    private readonly databaseService: DatabaseService
  ) {}

  async findAll(id, createdBy, companyid) {
    try {
      const cart = await this.cartRepository.findAll<Journal>({
        where: { adminid: id, createdBy, companyid, is_deleted: false },
      });

      let allDetails = [];

      for (let i = 0; i < cart.length; i++) {
        const journal = cart[i];

        const ledgerData: any = await this.ledger_details.findAllByQuery({
          where: {
            adminid: id,
            type: "Journal",
            journalid: journal?.id,
          },
          order: [["userdate", "DESC"]],
          include: [
            {
              model: AccountMaster,
              as: 'accountMasterDetails',
            },
          ],
        });

        const dat =
          ledgerData?.filter((ledger: any) => ledger?.debit !== "0.00") ||
          ledgerData?.ledgerDetails?.filter(
            (ledger: any) => ledger?.debit !== "0.00"
          );

        let contactData = <any>[];
        const d = await Promise.all(
          dat.map(async (ledg: any) => {
            if (ledg.cname) {
              let { data } = await this.contact_details.getOne(
                Number(ledg.cname)
              );
              contactData.push(data);
            } else {
              let data = ledg?.ledgerDetails;
              contactData.push(data);
            }
          })
        );
        allDetails.push({
          id: journal.id,
          reference: journal.reference,
          description: journal.description,
          total: journal.total,
          adminid: journal.adminid,
          userdate: journal.userdate,
          contactData,
        });
      }

      return new CommonResponseDto(allDetails, true, "Journal list");
    } catch (error) {
      console.error("Server Error:", error);
      throw error;
    }
  }


  async findAllByDate(adminid: number,companyid:number,sdate:any,ldate:any) {

    try {
      const cart = await this.cartRepository.findAll<Journal>({
        where: { 
           adminid,
           companyid,
           is_deleted: false,
           userdate:{
              [Op.gte]: sdate,
              [Op.lte]: ldate,
           }
           },
           attributes: ["id"],
           order: [["userdate", "DESC"]],
      });
      
      if (cart.length) {
        let journalDetails = [];
        let totalDebit = 0;
        let totalCredit = 0;
        let date = "";

        for (let i = 0; i < cart.length; i++) {
          const element = cart[i];

        const ledgerData = await this.ledger_details.findAllByQuery({
          where: {
            adminid: adminid,
            type: "Journal",
            journalid: element?.id,
          },
          order: [["userdate", "DESC"]],
          include: [
            {
              model: AccountMaster,
  as: 'accountMasterDetails',
            },
          ],
        });

        let ledgerDetails = await Promise.all(
          ledgerData.map(async (tmp) => {
            if (tmp.cname) {
              const contactData = await this.contact_details.getOneById(
                Number(tmp.cname)
              );
              const dataObj = {
                id:tmp.journalid,
                credit:tmp.credit,
                debit:tmp.debit,
                type:tmp.type,
                ledgerName:contactData.name,
                ledgerId:tmp.ledger,
                customerId:contactData.id,
                customerBusinessName:contactData.bus_name,
                sdate:tmp.sdate,
                customerName:contactData.name
              }
              totalDebit += tmp.debit;
              totalCredit += tmp.credit;
              date = tmp.sdate;

              return dataObj;
              
            } else {
              const dataObj = {
                id:tmp.journalid,
                credit:tmp.credit,
                debit:tmp.debit,
                type:tmp.type,
                ledgerName:tmp.ledgerDetails.laccount,
                ledgerId:tmp.ledger,
                customerId:null,
                customerBusinessName:null,
                sdate:tmp.sdate,
                customerName:null
              }

              totalDebit += tmp.debit;
              totalCredit += tmp.credit;
              date = tmp.sdate;

              return dataObj;
              
            }
          })
        );

        let dataObj = {
          totalCredit,
          totalDebit,
          type:"Journal",
          date,
          values:ledgerDetails
        }

        journalDetails.push(dataObj)
      }
      return new CommonResponseDto(journalDetails,true,"Journal Details")
    }
    } catch (error) {
      console.error("Server Error:", error);
      throw error;
    }
  }

  async findAllPages(pageOptionsDto: PageOptionsDto) {
    try {
      const skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
      const exp = await this.cartRepository.findAndCountAll<Journal>({
        where: {},
        limit: 10,
        offset: skip,
        order: [["id", pageOptionsDto.order]],
      });

      const entities = exp.rows.map((ctry) => new JournalDto(ctry));
      const itemCount = exp.count;

      const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(entities, pageMetaDto);
    } catch (error) {
      console.error("Server Error:", error);
      throw error;
    }
  }

  async findAllByQuery(query: any) {
    try {
    const data = await this.cartRepository.findAll<Journal>(query);
    return data.map((tmp) => new JournalDto(tmp));
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getOne(id: number) {
    let response: CommonResponseDto = {
      data: null,
      status: false,
      message: null,
    };
    try {
      const cart = await this.cartRepository.findByPk<Journal>(id);
      if (!cart) {
        throw new HttpException(
          "cart with given id not found",
          HttpStatus.NOT_FOUND
        );
      }
      if (cart) {
        response.data = new JournalDto(cart);
        const ledgerData = await this.ledger_details.findAllByQuery({
          where: {
            adminid: cart.adminid,
            journalid: id,
          },
          order: [["userdate", "DESC"]],
          include: [
            {
              model: AccountMaster,
             as: 'accountMasterDetails'
            },
          ],
        });

        let ledgerDetails = await Promise.all(
          ledgerData.map(async (tmp) => {
            if (tmp.ledger == 47 || tmp.ledger == 51) {
              const contactData = await this.contact_details.getOneById(
                Number(tmp.cname)
              );
              const data = { ...tmp, ...contactData };
              return data;
            } else {
              return new Object(tmp);
            }
          })
        );

        response.data.column = ledgerDetails;

        let data = response.data;

        if (response.data) {
          response.data = data;
          response.status = true;
          response.message = "Journal Details";
        } else {
          response.status = false;
          response.message = "No Data Found";
          response.data = [];
        }
      }
      return response;
    } catch (error) {
      console.error("Server Error:", error);
      throw error;
    }
  }

  async create(createDto: any) {
    let response: CommonResponseDto;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          const cart = new Journal();
          cart.reference = createDto.reference;
          cart.description = createDto.description;
          cart.total = createDto.total;
          cart.userid = createDto.userid;
          cart.adminid = createDto.adminid;
          cart.userdate = createDto.userdate;
          cart.is_deleted = false;
          cart.createdBy = createDto.createdBy;
          cart.companyid = createDto.companyid;
          let journel: any = await cart.save();
          response = await this.addJournelToLedger(
            journel,
            createDto,
            transaction
          );
        }
      );
    } catch (error) {
      console.log("Error:--", error);
      throw error;
    }
    return response;
  }

  async addJournelToLedger(journel: any, createDto: any, transaction: any) {
    try {
      let response: CommonResponseDto;
      if (journel) {
        let insertId = journel.id;
        let count = 0;

        let reorderedColumns = createDto.columns.sort((a, b) => {
          const isEmptyOrNullA = !a.cname;
          const isEmptyOrNullB = !b.cname;

          if (isEmptyOrNullA && !isEmptyOrNullB) {
            return 1;
          } else if (!isEmptyOrNullA && isEmptyOrNullB) {
            return -1;
          } else {
            return 0;
          }
        });

        let baseid = null;
        for (var i = 0; i < reorderedColumns.length; i++) {
          const element = reorderedColumns[i];
          let ledgerDetails;
          let contactDetails;

          let debit = element.debit || 0;
          let credit = element.credit || 0;

          if (element.ledger) {
            ledgerDetails = await this.account_master.findOne(element?.ledger);
            if (ledgerDetails?.type == "1") {
              let total =
                Number(ledgerDetails.total) + Number(debit) - Number(credit);
              const ledgerDetailsUpdate = await this.account_master.update(
                ledgerDetails.id,
                {
                  total: Number(total).toFixed(2),
                }
              );
            }
          } else {
            contactDetails = await this.contact_details.getOne(
              Number(element.cname)
            );
          }
          let jData = {
            ledger: element?.ledger
              ? element.ledger
              : contactDetails &&
                contactDetails?.data?.contractors_type == "customer"
              ? "47"
              : "51",
            ledgercategory: element?.ledger
              ? ledgerDetails?.data?.category
              : contactDetails &&
                contactDetails?.data?.contractors_type == "customer"
              ? "3"
              : "4",
            cname: element?.cname ? element?.cname : null,
            details: element.details,
            debit: debit,
            credit: credit,
            journalid: insertId,
            userid: createDto.userid,
            adminid: createDto.adminid,
            userdate: createDto.userdate,
            sdate: createDto.date,
            type: "Journal",
            usertype: "journal",
            booleantype: "19",
            baseid: baseid,
            createdBy: createDto.createdBy,
            companyid: createDto.companyid,
          };

          const updateLedgerDetails = await this.ledger_details.create(
            jData,
            transaction
          );
          if (i === 0) {
            baseid = updateLedgerDetails.id;
          }
        }
        response = {
          status: true,
          message: "Journal Created Successfully",
          data: {
            journel,
            count,
            insertId,
          },
        };
      } else {
        response = {
          status: false,
          message: "Server Error - Failed to create Journal",
          data: [],
        };
      }
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(
    id: number,
    updateDto: UpdateJournalDto
  ): Promise<CommonResponseDto> {
    try {
      const response = await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          const cart = await this.cartRepository.findByPk<Journal>(id);
          if (!cart) {
            throw new HttpException("Cart not found.", HttpStatus.NOT_FOUND);
          }
          cart.reference = updateDto.reference || cart.reference;
          cart.description = updateDto.description || cart.description;
          cart.total = updateDto.total || cart.total;
          cart.userid = updateDto.userid || cart.userid;
          cart.adminid = updateDto.adminid || cart.adminid;
          cart.userdate = updateDto.userdate || cart.userdate;
          cart.createdBy = updateDto.createdBy || cart.createdBy;
          cart.companyid = updateDto.companyid || cart.companyid;
          let journel: any = await cart.save();
          const response = await this.updateJournelToLedger(
            journel,
            updateDto,
            transaction
          );
          return response;
        }
      );
      return response;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async updateJournelToLedger(
    updateJournal: any,
    updateDto: any,
    transaction: any
  ): Promise<CommonResponseDto> {
    let response: CommonResponseDto = {
      data: null,
      status: false,
      message: null,
    };

    try {
      if (updateJournal) {
        const existingJournals = await this.ledger_details.findAllByQuery({
          where: {
            adminid: updateJournal?.adminid,
            journalid: updateJournal?.id,
          },
        });
        if (existingJournals) {
          for (let i = 0; i < existingJournals?.length; i++) {
            const element = existingJournals[i];
            if (element.ledger) {
              const ledgerData: any = await this.account_master.findOne(
                element?.ledger
              );

              if (ledgerData.status) {
                let total =
                  Number(ledgerData?.data?.total) -
                  Number(element?.debit - element?.credit);

                await this.account_master.update(
                  Number(ledgerData?.data?.id),
                  {
                    total: Number(total).toFixed(2),
                  },
                  transaction
                );
              }
            }
          }
        } else {
          console.log("No existing Journals");
        }
        const deleteJournal = await this.ledger_details.distroy({
          where: {
            adminid: updateJournal?.adminid,
            journalid: updateJournal?.id,
          },
          transaction,
        });

        for (let i = 0; i < updateDto?.column?.length; i++) {
          const element = updateDto?.column[i];
          let ledgerData;

          let debit = element.debit || 0;
          let credit = element.credit || 0;
          let contactDetails;

          if (element.ledger) {
            ledgerData = await this.account_master.findOne(element?.ledger);

            if (ledgerData.type == "1") {
              let total =
                Number(ledgerData?.total) + Number(debit) - Number(credit);
              const ledgerDataUpdate = await this.account_master.update(
                ledgerData?.id,
                {
                  total: Number(total).toFixed(2),
                }
              );
            }
          } else {
            contactDetails = await this.contact_details.getOne(
              Number(element.cname)
            );
          }

          let jData = {
            ledger: element?.ledger
              ? element.ledger
              : contactDetails &&
                contactDetails?.data?.contractors_type == "customer"
              ? "47"
              : "51",
            ledgercategory: element?.ledger
              ? ledgerData?.data?.category
              : contactDetails &&
                contactDetails?.data?.contractors_type == "customer"
              ? "3"
              : "4",
            cname: element?.cname ? element?.cname : null,
            details: element?.details,
            debit: element?.debit || 0,
            credit: element?.credit || 0,
            journalid: updateJournal?.id,
            userid: updateJournal?.userid,
            adminid: updateDto?.adminid,
            userdate: updateDto?.userdate,
            sdate: updateDto?.sdate || updateDto?.userdate,
            type: "Journal",
            usertype: "journal",
            booleantype: "19",
            createdBy: updateDto.createdBy,
            companyid: updateDto.companyid,
          };
          const updateLedgerDetails = await this.ledger_details.create(
            jData,
            transaction
          );
        }
        response = {
          status: true,
          message: "Journal Updated Successfully",
          data: {
            updateJournal: updateJournal.id,
            deleteJournal,
          },
        };
      } else {
        response = {
          status: false,
          message: "Failed to update Journal",
          data: [],
        };
      }
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const response = await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          try {
            const cart = await this.cartRepository.findByPk<Journal>(id);
            if (!cart) {
              return {
                status: false,
                message: "Failed to delete Journal - Journal not found",
              };
            }

            await cart.destroy();

            await this.ledger_details.distroy({
              where: {
                journalid: id,
              },
              transaction,
            });

            return {
              status: true,
              message: "Journal Deleted Successfully",
              data: cart,
            };
          } catch (error) {
            console.error("Error deleting journal:", error);
            return {
              status: false,
              message: "Failed to delete Journal - Internal Server Error",
            };
          }
        }
      );

      return response;
    } catch (error) {
      console.error("Transaction error:", error);
      throw error;
    }
  }
}
