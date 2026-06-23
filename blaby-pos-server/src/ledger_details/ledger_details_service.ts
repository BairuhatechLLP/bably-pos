import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { Op, where } from 'sequelize';
import { AccountMasterService } from '../account_master/account_master_service';
import { ContactMasterService } from '../contactMaster/contactMasterService';
import { PageDto, PageMetaDto, PageOptionsDto } from '../shared/dto';
import { User } from '../users/user.entity';
import { LedgerDetailsDto } from './dto/ledger_details_dto';
import { UpdateLedgerDetailsDto } from './dto/ledger_details_update';
import { LedgerDetails } from './ledger_details';
import { AccountMaster } from '../account_master/account_master';
import { SalesInvoiceService } from '../sale_invoice/sale_invoice_service';
import { DatabaseService } from '../database/database.service';
import { PurchaseInvoiceService } from '../purchase_invoice/purchase_invoice_service';
import { BankService } from '../bank/bank_service';
import { OtherMasterService } from '../other_master/other_master.service';

@Injectable()
export class LedgerDetailsService {
  @Inject(ContactMasterService)
  private readonly contactMasterService: ContactMasterService;

  @Inject(SalesInvoiceService)
  private readonly SalesInvoiceService: SalesInvoiceService;

  @Inject(PurchaseInvoiceService)
  private readonly PurchaseInvoiceRepository: PurchaseInvoiceService;
  @Inject(forwardRef(() => PurchaseInvoiceService))
  private readonly PurchaseInvoiceService: PurchaseInvoiceService;

  @Inject(forwardRef(() => AccountMasterService))
  private readonly account_details: AccountMasterService;

  @Inject(BankService)
  private readonly BankService: BankService;

  @Inject(OtherMasterService)
  private readonly otherMasterService: OtherMasterService

  constructor(
    @Inject('LedgerDetailsRepository')
    private readonly ledgerRepository: typeof LedgerDetails,
    private readonly databaseService: DatabaseService,
  ) {}

  async findAllList() {
    try {
      const data = await this.ledgerRepository.findAll<LedgerDetails>({
        include: [
          {
            model: User,
          },
        ],
      });
      return data.map((tmp) => new LedgerDetailsDto(tmp));
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findAll(pageOptionsDto: PageOptionsDto) {
    try {
      const skip = (pageOptionsDto.page - 1) * pageOptionsDto.take;
      const exp = await this.ledgerRepository.findAndCountAll<LedgerDetails>({
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'mobile'],
          },
        ],
        where: {},
        limit: pageOptionsDto.take,
        offset: skip,
        order: [['userid', pageOptionsDto.order]],
      });
  
      const entities = exp.rows.map((ctry) => new LedgerDetailsDto(ctry));
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
      const data = await this.ledgerRepository.findAll<LedgerDetails>(query);
      return data.map((tmp) => new LedgerDetailsDto(tmp));
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async sum(field: any, query: any) {
    try {
      const data = await this.ledgerRepository.sum(field, query);
      return data;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findOneById(id: number) {
    try {
      const ledger: any = await this.ledgerRepository.findOne<LedgerDetails>({
        where: { id },
        raw: true,
      });
      return ledger;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findOne(id: number) {
    try {
      const ledger: any = await this.ledgerRepository.findOne<LedgerDetails>({
        where: { id },
        raw: true,
      });
      if (ledger) {
        const ledgerName = await this.account_details.findByQuery(
          Number(ledger.ledger),
          {
            where: {
              adminid: Number(ledger.adminid),
            },
          },
        );
        ledger['ledgername'] = ledgerName.laccount;
        let nCust: any;
        if (ledger.cname) {
          nCust = await this.contactMasterService.getOne(Number(ledger.cname));
          ledger['name'] = nCust && nCust?.data && nCust?.data?.bus_name;
          ledger['paidAmount'] =
            ledger.debit == '0.00' ? ledger.credit : ledger.debit;
        } else {
          let laccountsName = '';
          if (ledger.baseid) {
            const nCust = await this.account_details.findByQuery(
              Number(ledger.paidfrom),
              {
                where: {
                  adminid: Number(ledger.adminid),
                },
              },
            );
            laccountsName = nCust.laccount;
          } else {
            const ledgerName: any =
              await this.ledgerRepository.findOne<LedgerDetails>({
                where: { baseid: ledger.id },
                raw: true,
              });
            ledger.paidfrom = ledgerName.ledger;
            const nCust = await this.account_details.findByQuery(
              Number(ledgerName.ledger),
              {
                where: {
                  adminid: Number(ledger.adminid),
                },
              },
            );
            laccountsName = nCust.laccount;
          }
          if (ledger.type == 'Bank Transfer') {
            ledger['secondname'] =
              ledger.debit == '0.00' ? ledgerName.laccount : laccountsName;
            ledger['paidfromname'] =
              ledger.debit == '0.00' ? laccountsName : ledgerName.laccount;
            ledger['paidAmount'] =
              ledger.debit == '0.00' ? ledger.credit : ledger.debit;
          } else {
            ledger['name'] = laccountsName;
            ledger['paidAmount'] =
              ledger.debit == '0.00' ? ledger.credit : ledger.debit;
          }
        }
      } else {
        throw new HttpException('No awb customer found', HttpStatus.NOT_FOUND);
      }
      return {
        status: true,
        data: ledger,
      };
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findOneByCashId(id: number, adminid: any, ledgerid: any) {
    try {
      const ledger: any = await this.ledgerRepository.findOne<LedgerDetails>({
        where: { id, adminid, ledger: ledgerid },
        raw: true,
      });
      if (!ledger) {
        return { status: false, data: {}, message: 'No data found' };
      }
      if (ledger) {
        const ledgerName = await this.account_details.findByQuery(
          Number(ledger.ledger),
          {
            where: {
              adminid: Number(ledger.adminid),
            },
          },
        );
        ledger['ledgername'] = ledgerName.laccount;
        let nCust: any;
        if (ledger.cname) {
          nCust = await this.contactMasterService.getOne(Number(ledger.cname));
          ledger['name'] = nCust && nCust?.data && nCust?.data?.bus_name;
          ledger['paidAmount'] =
            ledger.debit == '0.00' ? ledger.credit : ledger.debit;
        } else {
          let laccountsName = '';
          if (ledger.baseid) {
            const nCust = await this.account_details.findByQuery(
              Number(ledger.paidfrom),
              {
                where: {
                  adminid: Number(ledger.adminid),
                },
              },
            );
            laccountsName = nCust.laccount;
          } else {
            const ledgerName: any =
              await this.ledgerRepository.findOne<LedgerDetails>({
                where: { baseid: ledger.id },
                raw: true,
              });
            ledger.paidfrom = ledgerName.ledger;
            const nCust = await this.account_details.findByQuery(
              Number(ledgerName.ledger),
              {
                where: {
                  adminid: Number(ledger.adminid),
                },
              },
            );
            laccountsName = nCust.laccount;
          }
          if (ledger.type == 'Bank Transfer') {
            ledger['secondname'] =
              ledger.debit == '0.00' ? ledgerName.laccount : laccountsName;
            ledger['paidfromname'] =
              ledger.debit == '0.00' ? laccountsName : ledgerName.laccount;
            ledger['paidAmount'] =
              ledger.debit == '0.00' ? ledger.credit : ledger.debit;
          } else {
            ledger['name'] = laccountsName;
            ledger['paidAmount'] =
              ledger.debit == '0.00' ? ledger.credit : ledger.debit;
          }
        }
      }
      return {
        status: true,
        data: ledger,
      };
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findOneByQuery(query: any) {
    try {
      const ledger = await this.ledgerRepository.findOne<LedgerDetails>(query);
      if (!ledger) {
        return null;
      }
      return ledger;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findById(id: number) {
    try {
      const ledger = await this.ledgerRepository.findByPk<LedgerDetails>(id, {});
      if (!ledger) {
        throw new HttpException('No awb customer found', HttpStatus.NOT_FOUND);
      }
      return ledger;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async create(create: any, transaction?: any) {
    try {
      const ledger = new LedgerDetails();
      ledger.baseid = create.baseid;
      ledger.credit = create.credit;
      ledger.debit = create.debit;
      ledger.type = create.type;
      ledger.bankid = create.bankid;
      ledger.ledger = create.ledger;
      ledger.ledgercategory = create.ledgercategory;
      ledger.saleid = create.saleid;
      ledger.purchaseid = create.purchaseid;
      ledger.journalid = create.journalid;
      ledger.invoiceid = create.invoiceid;
      ledger.receiptid = create.receiptid;
      ledger.otherid = create.otherid;
      ledger.userid = create.userid;
      ledger.adminid = create.adminid;
      ledger.total = create.total;
      ledger.invoiceno = create.invoiceno;
      ledger.userdate = create.userdate;
      ledger.cname = create.cname;
      ledger.idescription = create.idescription;
      ledger.sdate = create.sdate;
      ledger.ldate = create.ldate;
      ledger.totalamount = create.totalamount;
      ledger.outstanding = create.outstanding;
      ledger.status = create.status;
      ledger.discount_status = create.discount_status;
      ledger.reference = create.reference;
      ledger.usedamount = create.usedamount;
      ledger.transferid = create.transferid;
      ledger.paidmethod = create.paidmethod;
      ledger.amount = create.amount;
      ledger.paidfrom = create.paidfrom;
      ledger.details = create.details;
      ledger.checked = create.checked;
      ledger.discount = create.discount;
      ledger.incomeTax = create.incomeTax;
      ledger.description = create.description;
      ledger.referenceid = create.referenceid;
      ledger.reconcile_status = create.reconcile_status;
      ledger.reconcileid = create.reconcileid;
      ledger.reconcile_date = create.reconcile_date;
      // ledger.used = create.used;
      ledger.booleantype = create.booleantype;
      ledger.usertype = create.usertype;
      ledger.costprice = create.costprice;
      ledger.quantity = create.quantity;
      // ledger.percentage = create.percentage;
      ledger.incomeTaxAmount = create.incomeTaxAmount;
      // ledger.priceType = create.priceType;
      ledger.invoiceimage = create.invoiceimage;
      ledger.invoicedoc = create.invoicedoc;
      ledger.vat = create.vat;
      ledger.vatamt = create.vatamt;
      ledger.totalamt = create.totalamt;
      ledger.includevat = create.includevat;
      // ledger.showVat = create.showVat;
      // ledger.itemorder = create.itemorder;
      ledger.customer_name = create.customer_name;
      ledger.customer_name = create.customer_name;
      ledger.running_total = create.running_total;
      ledger.is_deleted = false;
      ledger.payrollid=create.payrollid;
      ledger.employeeid=create.employeeid;
      ledger.createdBy=create.createdBy;
      ledger.companyid=create.companyid;
      ledger.stockTransferId = create.stockTransferId;
      ledger.seriesNo = create.seriesNo;
      return ledger.save({ transaction });
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateByQuery(data, query) {
    try {
      let update = await this.ledgerRepository.update(data, query);
      return update;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async update(id: number, update: any) {
    let response: any;
    try {
      if (update?.receipttype === 'Supplier Refund') {
        const updatePurchaseInvoice =
          await this.PurchaseInvoiceRepository.update(
            update?.item[0]?.id,
            update,
          );
      }
      const ledger = await this.findById(id);
      ledger.baseid = update.baseid || ledger.baseid;
      ledger.debit =
        update?.receipttype === 'Supplier Payment' ||
        update?.receipttype === 'Customer Refund' ||
        update.receipttype === 'Other Payment'
          ? update.amount || ledger.amount
          : 0;
      ledger.debit =
        update?.receipttype === 'Supplier Payment' ||
        update?.receipttype === 'Customer Refund' ||
        update.receipttype === 'Other Payment'
          ? 0
          : update.amount || ledger.amount;
      // ledger.credit = update.credit || ledger.credit;
      // ledger.debit = update.debit || ledger.debit;
      ledger.type = update.type || ledger.type;
      ledger.bankid = update.bankid || ledger.bankid;
      ledger.ledger = update.ledger || ledger.ledger;
      ledger.ledgercategory = update.ledgercategory || ledger.ledgercategory;
      ledger.saleid = update.saleid || ledger.saleid;
      ledger.purchaseid = update.purchaseid || ledger.purchaseid;
      ledger.journalid = update.journalid || ledger.journalid;
      ledger.invoiceid = update.invoiceid || ledger.invoiceid;
      ledger.receiptid = update.receiptid || ledger.receiptid;
      ledger.otherid = update.otherid || ledger.otherid;
      ledger.userid = update.userid || ledger.userid;
      ledger.adminid = update.adminid || ledger.adminid;
      ledger.total = update.amount || ledger.total;
      ledger.invoiceno = update.invoiceno || ledger.invoiceno;
      ledger.userdate = update.userdate || ledger.userdate;
      ledger.cname = update.cname || ledger.cname;
      ledger.idescription = update.idescription || ledger.idescription;
      ledger.sdate = update.sdate || ledger.sdate;
      ledger.ldate = update.ldate || ledger.ldate;
      ledger.totalamount = update.amount || ledger.totalamount;
      ledger.outstanding = update.outstanding || ledger.outstanding;
      ledger.status = update.status || ledger.status;
      ledger.discount_status = update.discount_status || ledger.discount_status;
      ledger.reference = update.reference || ledger.reference;
      ledger.usedamount = update.usedamount || ledger.usedamount;
      ledger.transferid = update.transferid || ledger.transferid;
      ledger.paidmethod = update.paidmethod || ledger.paidmethod;
      ledger.amount = update.amount || ledger.amount;
      ledger.paidfrom = update.paidfrom || ledger.paidfrom;
      ledger.details = update.details || ledger.details;
      ledger.checked = update.checked || ledger.checked;
      ledger.discount = update.discount || ledger.discount;
      ledger.incomeTax = update.incomeTax || ledger.incomeTax;
      ledger.description = update.description || ledger.description;
      ledger.referenceid = update.referenceid || ledger.referenceid;
      ledger.reconcile_status =
        update.reconcile_status || ledger.reconcile_status;
      ledger.reconcileid = update.reconcileid || ledger.reconcileid;
      ledger.reconcile_date = update.reconcile_date || ledger.reconcile_date;
      ledger.used = update.used || ledger.used;
      ledger.booleantype = update.booleantype || ledger.booleantype;
      ledger.usertype = update.usertype || ledger.usertype;
      ledger.costprice = update.costprice || ledger.costprice;
      ledger.quantity = update.quantity || ledger.quantity;
      ledger.percentage = update.percentage || ledger.percentage;
      ledger.incomeTaxAmount = update.incomeTaxAmount || ledger.incomeTaxAmount;
      ledger.priceType = update.priceType || ledger.priceType;
      ledger.invoiceimage = update.invoiceimage || ledger.invoiceimage;
      ledger.invoicedoc = update.invoicedoc || ledger.invoicedoc;
      ledger.vat = update.vat || ledger.vat;
      ledger.vatamt = update.vatamt || ledger.vatamt;
      ledger.totalamt = update.totalamt || ledger.totalamt;
      ledger.includevat = update.includevat || ledger.includevat;
      ledger.showVat = update.showVat || ledger.showVat;
      ledger.itemorder = update.itemorder || ledger.itemorder;
      ledger.payrollid = update.payrollid ||  ledger.payrollid;
      ledger.employeeid = update.employeeid || ledger.employeeid;
      ledger.createdBy = update.createdBy || ledger.createdBy;
      ledger.companyid = update.companyid || ledger.companyid;
      ledger.stockTransferId = update.stockTransferId || ledger.stockTransferId;
      ledger.seriesNo = update.seriesNo || ledger.seriesNo;
  
      let ledgerUpdate = await ledger.save();

      response = {
        data: ledgerUpdate,
        status: true,
        message: 'Sucessfully updated',
      };

      return response;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async delete(id: number) {
    try {
      const ledger = await this.findById(id);
      await ledger.destroy();
      return ledger;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async distroy(query) {
    try {
      let data = await this.ledgerRepository.destroy(query);
      return data;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async count(query) {
    try {
      let data = await this.ledgerRepository.count(query);
      return data;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateBank(id: number, update: any): Promise<LedgerDetails> {
    let response: any;
    try {
      const ledger = await this.findById(id);
      ledger.reference = update.reference || ledger.reference;
      ledger.cname = update.cname || ledger.cname;
      ledger.debit = Number(update.debit) || ledger.debit;
      ledger.paidfrom = update.paidfrom || ledger.paidfrom;
      ledger.paidmethod = update.paidmethod || ledger.paidmethod;
      ledger.reconcile_status = update.reconcile_status;
      ledger.reconcile_date = update.reconcile_date;
      const data = await ledger.save();
      response = {
        data: data,
        status: true,
      };
      return response;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findAllInDateRange(
    adminid: any,
    cname: any,
    sdate: any,
    ldate: any,
  ): Promise<LedgerDetails[]> {
    const startDate = new Date(sdate);
    const endDate = new Date(ldate);
    startDate.setDate(startDate.getDate() + 1);
    try {
      const records: any = await this.findAllByQuery({
        where: {
          adminid: Number(adminid),
          cname: Number(cname),
          created_at: {
            [Op.lte]: endDate,
            [Op.gte]: startDate,
          },
          discount_status: {
            [Op.or]: [{ [Op.ne]: 1 }, { [Op.is]: null }],
          },
          booleantype: [
            '14',
            '22',
            '8',
            '6',
            '4',
            '5',
            '3',
            '42',
            '7',
            '13',
            '23',
            '16',
            '15',
            '97',
            //'19',
          ],
        },
      });

      const journal: any = await this.findAllByQuery({
        where: {
          adminid: Number(adminid),
          cname: Number(cname),
          type: 'Journal',
          created_at: {
            [Op.between]: [endDate, startDate],
          },
        },
      });
      let ledgeraccount = [];
      if (journal?.length) {
        for (let i = 0; i < journal.length; i++) {
          const element = journal[i];
          const currentLedger = await this.findAllByQuery({
            include: [
              {
                model: AccountMaster,
                as: 'ledgerDetails',
              },
            ],
            where: {
              adminid: Number(adminid),
              journalid: element.journalid,
            },
          });
          ledgeraccount = [...currentLedger];
        }
      }

      const ledgers = [...records, ...ledgeraccount];

      const uniqueLedgerAccount = Array.from(
        new Set(ledgers.map((item) => item.id)),
      ).map((id) => ledgers.find((item) => item.id === id));

      return uniqueLedgerAccount;
      //return ledgers;
      // return records;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async Delete(id: number) {
    try {

      const ledger:any = await this.ledgerRepository.findAll({
        where: {
          [Op.or]: [{ id: id }, { baseid: id }],
        },
      });

      for (let i = 0; i < ledger.length; i++) {
        ledger[i].is_deleted = true;
        let led = ledger[i].save();
      }
      let res = {
        message: 'Deleted Successfully',
        status: true,
      };
      return res;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateCashDeatails(id: number, update: any) {
    let response: any;
    try {
      const ledger:any = await this.ledgerRepository.findAll({
        where: {
          [Op.or]: [{ id: id }, { baseid: id }],
        },
      });

      if( ledger[0]?.type == 'Other Receipt' || ledger[0]?.type == 'Other Payment'){

        let otherDataObj = {
          adminId:update.adminid,
          companyId:update.companyid,
          total:ledger[0]?.type == 'Other Receipt' ? update.debit : update.credit,
          ledgerId: ledger[0]?.ledger,
          cname:ledger[0]?.cname,
          createdBy:update.createdBy,
          date: new Date(),
          type:ledger[0]?.type
        };

        const otherData = await this.otherMasterService.update(Number(ledger[0]?.otherid),otherDataObj); 
      }

      let data5: any = {
        outstanding: ledger[0].amount,
        status: ledger[0].totalamt == ledger[0].amount ? '0' : '1',
      };
      if (
        ledger[0].type == 'Supplier Payment' ||
        ledger[0].type == 'Supplier Refund'
      ) {
        if (ledger[0].purchaseid !== update.purchaseid) {
          const resultSales = await this.PurchaseInvoiceService.updateDataa(
            ledger[0].purchaseid,
            data5,
          );
        }
      }
      if (
        ledger[0].type == 'Customer Refund' ||
        ledger[0].type == 'Customer Receipt' ||
        ledger[0].type == 'Customer Reciept' ||
        ledger[0].type == 'Customer Reciept' 
      ) {
        if (ledger[0].saleid !== update.saleid) {
          const resultSales = await this.SalesInvoiceService.updateDataa(
            ledger[0].saleid,
            data5,
          );
        }
      }

      const ledgerView = await this.account_details.findById(ledger[0].ledger);
      const totalamount = ledgerView.total;
      let totalamountplus;
      if (
        ledger[0]?.type == 'Customer Receipt' ||
        ledger[0]?.type == 'Supplier Refund' ||
        ledger[0]?.type == 'Other Receipt'
      ) {
        totalamountplus =
          Number(totalamount) -
          Number(ledger[0]?.debit) +   //  Number(ledger[0]?.credit) +
          Number(update.debit);        //  Number(update.credit);
      } else if (
        ledger[0].type == 'Supplier Payment' ||
        ledger[0]?.type == 'Customer Refund' ||
        ledger[0]?.type == 'Other Payment'
      ) {
        totalamountplus =
          Number(totalamount) +
          Number(ledger[0]?.credit) -   // Number(ledger[0]?.debit) -
          Number(update?.credit); //Number(update?.debit); 
      }

      const data10 = {
        total: totalamountplus,
        userdate: ledgerView.userdate,
      };
      const updateLedger = await this.account_details.update(
        ledger[0].ledger,
        data10,
      );
      if (ledger) {
        let ledgerUpdateData = [];
        for (let i = 0; i < ledger.length; i++) {
          if (ledger[i].type == 'Other Payment') {
            ledger[i].ledger = ledger[i].baseid
              ? update.cname
                ? '47'
                : update.ledger
              : ledger[i].ledger;
          } else if (ledger[i].type == 'Other Receipt') {
            ledger[i].ledger = ledger[i].baseid
              ? update.cname
                ? '47'
                : update.ledger
              : ledger[i].ledger;
          } else {
            ledger[i].ledger = ledger[i].baseid
              ? update.ledger || ledger[i].ledger
              : ledger[i].ledger;
          }
          ledger[i].credit = ledger[i].baseid
            ? update.debit
            : update.credit || ledger[i].credit;
          ledger[i].debit = ledger[i].baseid
            ? update.credit
            : update.debit || ledger[i].debit || '0.00';
          ledger[i].type = update.type || ledger[i].type;
          ledger[i].bankid = update.bankid || ledger[i].bankid;
          ledger[i].ledger = ledger[i].baseid
            ? update.ledger || ledger[i].ledger
            : ledger[i].ledger;
          ledger[i].ledgercategory =
            update.ledgercategory || ledger[i].ledgercategory;
            ledger[i].ledgerCategoryGroup =
            update.ledgerCategoryGroup || ledger[i].ledgerCategoryGroup;
          ledger[i].saleid = update.saleid || ledger[i].saleid;
          ledger[i].purchaseid = update.purchaseid || ledger[i].purchaseid;
          ledger[i].journalid = update.journalid || ledger[i].journalid;
          ledger[i].invoiceid = update.invoiceid || ledger[i].invoiceid;
          ledger[i].receiptid = update.receiptid || ledger[i].receiptid;
          ledger[i].otherid = update.otherid || ledger[i].otherid;
          ledger[i].userid = update.userid || ledger[i].userid;
          ledger[i].adminid = update.adminid || ledger[i].adminid;
          ledger[i].total = -update.amount || ledger[i].total;
          ledger[i].invoiceno = update.invoiceno || ledger[i].invoiceno;
          ledger[i].userdate = update.userdate || ledger[i].userdate;
          ledger[i].cname = update.ledger
            ? null
            : update.cname
            ? update.cname
            : ledger[i].cname;
          ledger[i].idescription =
            update.idescription || ledger[i].idescription;
          ledger[i].sdate = update.sdate || ledger[i].sdate;
          ledger[i].ldate = update.ldate || ledger[i].ldate;
          ledger[i].totalamount = update.amount || ledger[i].totalamount;
          ledger[i].outstanding = update.outstanding || ledger[i].outstanding;
          ledger[i].status = update.status || ledger[i].status;
          ledger[i].discount_status =
            update.discount_status || ledger[i].discount_status;
          ledger[i].reference = update.reference || ledger[i].reference;
          ledger[i].usedamount = update.usedamount || ledger[i].usedamount;
          ledger[i].transferid = update.transferid || ledger[i].transferid;
          ledger[i].paidmethod = update.paidmethod || ledger[i].paidmethod;
          ledger[i].amount = update.rout || ledger[i].amount;
          ledger[i].paidfrom = update.paidfrom || ledger[i].paidfrom;
          ledger[i].details = update.details || ledger[i].details;
          ledger[i].checked = update.checked || ledger[i].checked;
          ledger[i].discount = update.discount || ledger[i].discount;
          ledger[i].incomeTax = update.incomeTax || ledger[i].incomeTax;
          ledger[i].description = update.description || ledger[i].description;
          ledger[i].referenceid = update.referenceid || ledger[i].referenceid;
          ledger[i].reconcile_status =
            update.reconcile_status || ledger[i].reconcile_status;
          ledger[i].reconcileid = update.reconcileid || ledger[i].reconcileid;
          ledger[i].reconcile_date =
            update.reconcile_date || ledger[i].reconcile_date;
          ledger[i].used = update.used || ledger[i].used;
          ledger[i].booleantype = update.booleantype || ledger[i].booleantype;
          ledger[i].usertype = update.usertype || ledger[i].usertype;
          ledger[i].costprice = update.costprice || ledger[i].costprice;
          ledger[i].quantity = update.quantity || ledger[i].quantity;
          ledger[i].percentage = update.percentage || ledger[i].percentage;
          ledger[i].incomeTaxAmount =
            update.incomeTaxAmount || ledger[i].incomeTaxAmount;
          ledger[i].priceType = update.priceType || ledger[i].priceType;
          ledger[i].invoiceimage =
            update.invoiceimage || ledger[i].invoiceimage;
          ledger[i].invoicedoc = update.invoicedoc || ledger[i].invoicedoc;
          ledger[i].vat = update.vat || ledger[i].vat;
          ledger[i].vatamt = update.vatamt || ledger[i].vatamt;
          ledger[i].totalamt = update.totalamt || ledger[i].totalamt;
          ledger[i].includevat = update.includevat || ledger[i].includevat;
          ledger[i].showVat = update.showVat || ledger[i].showVat;
          ledger[i].itemorder = update.itemorder || ledger[i].itemorder;
          ledger[i].createdBy = update.createdBy || ledger[i].createdBy; 
          ledger[i].companyid = update.companyid || ledger[i].companyid; 
          ledger[i].stockTransferId = update.stockTransferId || ledger[i].stockTransferId; 
          ledger[i].running_total =
            update.running_total || ledger[i].running_total;

          let ledgerUpdate = await ledger[i].save();
          ledgerUpdateData.push(ledgerUpdate);
          let status = '2';
          if (update.outstanding == 0) {
            status = '2';
          } else {
            status = '1';
          }
          const data3: any = {
            outstanding: update.outstanding,
            status,
            userdate: ledger[i].userdate,
          };
          let data1: any = {
            outstanding: update.outstanding,
            status,
          };
          if (
            ledger[0].type == 'Customer Refund' ||
            ledger[0].type == 'Customer Receipt' ||
            ledger[0].type == 'Customer Reciept'
          ) {
            const resultSales = await this.SalesInvoiceService.updateDataa(
              update.saleid || ledger[0].saleid,
              data3,
            );
          }
          if (
            ledger[0].type == 'Supplier Payment' ||
            ledger[0].type == 'Supplier Refund'
          ) {
            const resultSales = await this.PurchaseInvoiceService.updateDataa(
              update.purchaseid || ledger[0].purchaseid,
              data1,
            );
          }
        }

        response = {
          data: ledgerUpdateData,
          status: true,
          message: 'Sucessfully updated',
        };
      } else {
        response = {
          status: false,
          message: 'Ledger Not Found',
        };
      }
      return response;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateBankDetails(id: number, update: any) {
    let response: any;
    try {
      // const query = ` SELECT * FROM taxgovtwo.ledger_details 
      // WHERE (id IN (${id}) OR baseid IN (${id}))`;
      // const ledger = await this.databaseService.getSequelize.query(query, {
      //   model: LedgerDetails,
      //   mapToModel: true,
      // });

      const ledger:any = await this.ledgerRepository.findAll({
        where: {
          [Op.or]: [{ id: id }, { baseid: id }],
        },
      });

      const ledgerView = await this.account_details.findById(ledger[0].ledger);
      const totalamount = ledgerView.total;
      let totalamountplus;
      if (
        ledger[0]?.type == 'Customer Reciept' ||
        ledger[0]?.type == 'Customer Receipt' ||
        ledger[0]?.type == 'Supplier Refund' ||
        ledger[0]?.type == 'Other Receipt'
      ) {
        totalamountplus =
          Number(totalamount) -
          Number(ledger[0]?.debit) +
          Number(update.amount);  
      } else if (
        ledger[0].type == 'Supplier Payment' ||
        ledger[0]?.type == 'Customer Refund' ||
        ledger[0]?.type == 'Other Payment'
      ) {
        totalamountplus =
          Number(totalamount) +
          Number(ledger[0]?.credit) -
          Number(update?.amount);
      }

      const data10 = {
        total: totalamountplus,
        userdate: ledgerView.userdate,
      };
      const updateLedger = await this.account_details.update(
        ledger[0].ledger,
        data10,
      );
      if (ledger) {
        let ledgerUpdateData = [];
        for (let i = 0; i < ledger.length; i++) {
          if (
            update.type == 'Supplier Payment' ||
            update.type == 'Other Payment'
          ) {
            ledger[i].debit = ledger[i].baseid
              ? update.amount
              : ledger[i].debit;
            ledger[i].credit = ledger[i].baseid
              ? ledger[i].credit
              : update.amount;
          } else {
            ledger[i].debit = ledger[i].baseid
              ? ledger[i].debit
              : update.amount;
            ledger[i].credit = ledger[i].baseid
              ? update.amount
              : ledger[i].credit;
          }

          if(ledger[i].type == 'Other Payment'){
            ledger[i].ledger = ledger[i].baseid
            ? update.ledger || '51'
            : ledger[i].ledger;
          }else if(ledger[i].type == 'Other Receipt'){
            ledger[i].ledger = ledger[i].baseid
            ? update.ledger || '47'
            : ledger[i].ledger;
          }else{
            ledger[i].ledger = ledger[i].baseid
            ? update.ledger || ledger[i].ledger
            : ledger[i].ledger;
          }
          ledger[i].outstanding = update.outstanding || ledger[i].outstanding;
          ledger[i].totalamount = update.totalamount || ledger[i].totalamount;
          ledger[i].type = update.type || ledger[i].type;
          ledger[i].bankid = update.bankid || ledger[i].bankid;
          ledger[i].ledgercategory =
            update.ledgercategory || ledger[i].ledgercategory;
            ledger[i].ledgerCategoryGroup =
            update.ledgerCategoryGroup || ledger[i].ledgerCategoryGroup;
          ledger[i].saleid = update.saleid || ledger[i].saleid;
          ledger[i].purchaseid = update.purchaseid || ledger[i].purchaseid;
          ledger[i].journalid = update.journalid || ledger[i].journalid;
          ledger[i].invoiceid = update.invoiceid || ledger[i].invoiceid;
          ledger[i].receiptid = update.receiptid || ledger[i].receiptid;
          ledger[i].otherid = update.otherid || ledger[i].otherid;
          ledger[i].userid = update.userid || ledger[i].userid;
          ledger[i].adminid = update.adminid || ledger[i].adminid;
          ledger[i].total = -update.amount || ledger[i].total;
          ledger[i].invoiceno = update.invoiceno || ledger[i].invoiceno;
          ledger[i].userdate = update.userdate || ledger[i].userdate;
          ledger[i].cname = update.cname || ledger[i].cname;
          ledger[i].idescription =
            update.idescription || ledger[i].idescription;
          ledger[i].sdate = update.sdate || ledger[i].sdate;
          ledger[i].ldate = update.ldate || ledger[i].ldate;

          ledger[i].status = update.status || ledger[i].status;
          ledger[i].discount_status =
            update.discount_status || ledger[i].discount_status;
          ledger[i].reference = update.reference || ledger[i].reference;
          ledger[i].usedamount = update.usedamount || ledger[i].usedamount;
          ledger[i].transferid = update.transferid || ledger[i].transferid;
          ledger[i].paidmethod = update.paidmethod || ledger[i].paidmethod;
          ledger[i].amount = update.amount || ledger[i].amount;
          ledger[i].paidfrom = update.paidfrom || ledger[i].paidfrom;
          ledger[i].details = update.details || ledger[i].details;
          ledger[i].checked = update.checked || ledger[i].checked;
          ledger[i].discount = update.discount || ledger[i].discount;
          ledger[i].incomeTax = update.incomeTax || ledger[i].incomeTax;
          ledger[i].description = update.description || ledger[i].description;
          ledger[i].referenceid = update.referenceid || ledger[i].referenceid;
          ledger[i].reconcile_status =
            update.reconcile_status || ledger[i].reconcile_status;
          ledger[i].reconcileid = update.reconcileid || ledger[i].reconcileid;
          ledger[i].reconcile_date =
            update.reconcile_date || ledger[i].reconcile_date;
          ledger[i].used = update.used || ledger[i].used;
          ledger[i].booleantype = update.booleantype || ledger[i].booleantype;
          ledger[i].usertype = update.usertype || ledger[i].usertype;
          ledger[i].costprice = update.costprice || ledger[i].costprice;
          ledger[i].quantity = update.quantity || ledger[i].quantity;
          ledger[i].percentage = update.percentage || ledger[i].percentage;
          ledger[i].incomeTaxAmount =
            update.incomeTaxAmount || ledger[i].incomeTaxAmount;
          ledger[i].priceType = update.priceType || ledger[i].priceType;
          ledger[i].invoiceimage =
            update.invoiceimage || ledger[i].invoiceimage;
          ledger[i].invoicedoc = update.invoicedoc || ledger[i].invoicedoc;
          ledger[i].vat = update.vat || ledger[i].vat;
          ledger[i].vatamt = update.vatamt || ledger[i].vatamt;
          ledger[i].totalamt = update.totalamt || ledger[i].totalamt;
          ledger[i].includevat = update.includevat || ledger[i].includevat;
          ledger[i].showVat = update.showVat || ledger[i].showVat;
          ledger[i].customer_name =
            update.customer_name || ledger[i].customer_name;
          ledger[i].itemorder = update.itemorder || ledger[i].itemorder;
          ledger[i].running_total =
            update.running_total || ledger[i].running_total;
            ledger[i].createdBy = update.createdBy || ledger[i].createdBy; //createdBy
            ledger[i].companyid = update.companyid || ledger[i].companyid;
            ledger[i].stockTransferId = update.stockTransferId || ledger[i].stockTransferId;

          let ledgerUpdate = await ledger[i].save();
          ledgerUpdateData.push(ledgerUpdate);
          let status = '2';
          if (update.outstanding == 0) {
            status = '2';
          } else {
            status = '1';
          }
          const data3: any = {
            outstanding: update.outstanding,
            status,
            userdate: ledger[i].userdate,
          };
          let data1: any = {
            outstanding: update.outstanding,
            status,
          };
          if (
            ledger[0].type == 'Customer Refund' ||
            ledger[0].type == 'Customer Receipt' ||
            ledger[0].type == 'Customer Reciept'
          ) {
            const resultSales = await this.SalesInvoiceService.updateDataa(
              ledger[0].saleid,
              data3,
            );
          }

          if (
            ledger[0].type == 'Supplier Payment' ||
            ledger[0].type == 'Supplier Refund'
          ) {
            const resultSales = await this.PurchaseInvoiceService.updateDataa(
              ledger[0].purchaseid,
              data1,
            );
          }
        }

        response = {
          data: ledgerUpdateData,
          status: true,
          message: 'Sucessfully updated',
        };
      } else {
        response = {
          status: false,
          message: 'Ledger Not Found',
        };
      }
      return response;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateContraVoucher(id: number, update: any) {
    let response: any;
    try {

      const ledger:any = await this.ledgerRepository.findAll({
        where: {
          [Op.or]: [{ id: id }, { baseid: id }],
        },
      });

      const deletedOtherData = await this.otherMasterService.delete(ledger[0].otherid)

      if (ledger.length === 1) {
        const secondLedger = await this.findById(ledger[0].baseid);
        ledger.push(secondLedger);
      }

      if (ledger.length == 2) {
        for (let i = 0; i < ledger.length; i++) {
          const ledgerView = await this.account_details.findById(
            ledger[i].ledger,
          );
          let totalamountplus;
          if (ledger[i]?.baseid) {
            totalamountplus =
              Number(ledgerView.total) - Number(ledger[i]?.debit);
          } else {
            totalamountplus =
              Number(ledgerView.total) + Number(ledger[i]?.credit);
          }
          const data10 = {
            total: totalamountplus,
            userdate: update.sdate,
          };
          const updateLedger = await this.account_details.update(
            ledger[i].ledger,
            data10,
          );
        }
      }
      let deleteLedger: boolean = false;
      for (let i = 0; i < ledger.length; i++) {
        const deleteLedgers = await this.delete(ledger[i].id);
        if (i === ledger.length - 1) {
          deleteLedger = true;
        }
      }
      let ledgerData;
      if (deleteLedger) {
        ledgerData = await this.BankService.bankTransfer(update);
      }
      if (ledgerData) {
        response = {
          data: ledgerData,
          status: true,
          message: 'Sucessfully updated',
        };
      } else {
        response = {
          status: false,
          message: ledger,
        };
      }
      return response;
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async delateTransaction(id: number) {
    let responce;
    try {    
    const ledger:any = await this.ledgerRepository.findAll({
      where: {
        [Op.or]: [{ id: id }, { baseid: id }],
      },
    });

      if (ledger.length === 1) {
        const secondLedger = await this.findById(ledger[0].baseid);
        ledger.push(secondLedger);
      }
      if (ledger.length === 1) {
        const secondLedger = await this.findById(ledger[0].baseid);
        ledger.push(secondLedger);
      }
      if (ledger.length == 2) {
        for (let i = 0; i < ledger.length; i++) {
          const ledgerView = await this.account_details.findById(
            ledger[i].ledger,
          );
          let totalamountplus;
          if (ledger[0]?.type == 'Bank Transfer') {
            if (ledger[i]?.baseid) {
              totalamountplus =
                Number(ledgerView.total) - Number(ledger[i]?.credit);
            } else {
              totalamountplus =
                Number(ledgerView.total) + Number(ledger[i]?.debit);
            }
          } else if (
            ledger[0]?.type == 'Customer Receipt' ||
            ledger[0]?.type == 'Customer Reciept' ||
            ledger[0]?.type == 'Supplier Refund' ||
            ledger[0]?.type == 'Other Receipt'
          ) {
            totalamountplus =
              Number(ledgerView?.total) - Number(ledger[0]?.debit);
          } else if (
            ledger[0].type == 'Supplier Payment' ||
            ledger[0]?.type == 'Customer Refund' ||
            ledger[0]?.type == 'Other Payment'
          ) {
            totalamountplus =
              Number(ledgerView.total) + Number(ledger[0]?.credit);
          }
          const data10 = {
            total: totalamountplus,
            userdate: new Date(),
          };
          const updateLedger = await this.account_details.update(
            ledger[i].ledger,
            data10,
          );
        }
        let data3: any;
        let data1: any;
        if (
          ledger[0].type == 'Customer Refund' ||
          ledger[0].type == 'Customer Receipt' ||
          ledger[0].type == 'Customer Reciept' 
        ) {
          const getSale = await this.SalesInvoiceService.findOne(
            ledger[0].saleid,
          );
          let customerAmount =
            ledger[0].type == 'Customer Receipt' || ledger[0].type == 'Customer Reciept'
              ? Number(ledger[0].debit)
              : Number(ledger[0].credit);
          let outstandingSale = Number(getSale.outstanding) + customerAmount;
          let status;
          if (outstandingSale == getSale.total) {
            status = '0';
          } else {
            status = '1';
          }
          data3 = {
            outstanding: outstandingSale,
            status,
            userdate: new Date(),
          };
          const resultSales = await this.SalesInvoiceService.updateDataa(
            ledger[0].saleid,
            data3,
          );
        }
        if (
          ledger[0].type == 'Supplier Payment' ||
          ledger[0].type == 'Supplier Refund'
        ) {
          const getPurchace = await this.PurchaseInvoiceService.getOne(
            ledger[0].purchaseid,
          );
          let supplierAmount =
            ledger[0].type == 'Supplier Payment'
              ? Number(ledger[0].credit)
              : Number(ledger[0].debit);
          let outstandingPurchace =
            Number(getPurchace.outstanding) + supplierAmount;
          let status;
          if (outstandingPurchace == getPurchace.total) {
            status = '0';
          } else {
            status = '1';
          }
          data1 = {
            outstanding: outstandingPurchace,
            status,
          };
          const resultSales = await this.PurchaseInvoiceService.updateDataa(
            ledger[0].purchaseid,
            data1,
          );
        }
        let deleteLedgers;
        if (ledger.length == 2) {
          for (let i = 0; i < ledger.length; i++) {
            deleteLedgers = await this.delete(ledger[i].id);
          }
          responce = {
            status: true,
            message: 'Delete Transaction',
            data: deleteLedgers,
          };
        } else {
          responce = {
            status: false,
            message: 'Not Find Your Transaction',
            data: [],
          };
        }
      }
    } catch (error) {
      console.log(error)
      throw error
    }
    return responce;
  }
}
