import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Op } from 'sequelize';
import { AccountMaster } from '../account_master/account_master';
import { AccountMasterService } from '../account_master/account_master_service';
import { ContactMasterService } from '../contactMaster/contactMasterService';
import { DatabaseService } from '../database/database.service';
import { LedgerDetailsService } from '../ledger_details/ledger_details_service';
import { PurchaseInvoice } from '../purchase_invoice/purchase_invoice_model';
import { SaleInvoice } from '../sale_invoice/sale_invoice';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import moment from 'moment';
import { EmployeesService } from '../payroll_employees/employeeServices';
import { LedgerDetails } from '../ledger_details/ledger_details';
import { OtherMasterService } from '../other_master/other_master.service';

@Injectable()
export class BankService {
  @Inject(forwardRef(() => AccountMasterService))
  private readonly account_details: AccountMasterService;

  @Inject(forwardRef(() => LedgerDetailsService))
  private readonly ledger_details: LedgerDetailsService;

  @Inject(forwardRef(() => ContactMasterService))
  private readonly contactMasterService: ContactMasterService;

  @Inject(OtherMasterService)
  private readonly otherMasterService: OtherMasterService

  constructor(
    private databaseService: DatabaseService,
    private readonly employee_service: EmployeesService,
  ) {}

  async getBankDetails(id, adminid) {
    let response: CommonResponseDto;
    try {
      const bankDetails = await this.account_details.findByQuery(id, {
        where: {
          adminid: adminid,
        },
      });
      if (bankDetails) {
        var ledgercount = await this.ledger_details.count({
          where: {
            adminid: adminid,
            [Op.or]: [{ ledger: id }, { paidfrom: String(id) }],
            booleantype: {
              [Op.notIn]: [7, 8],
            },
            status: {
              [Op.ne]: '4',
            },
            discount_status: {
              [Op.ne]: '1',
            },
          },
        });
        const currentBeforeDate = await this.ledger_details.findAllByQuery({
          where: {
            adminid: adminid,
            ledger: id,
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

        // var othercount = await cusotherrec_details.count({
        //   where: {
        //     userid,
        //     bankid: String(id),
        //     type: "nonused",
        //   },
        // });

        const totalTransaction = Number(ledgercount) + Number(0);
        response = {
          status: true,
          message: 'Banking Details',
          data: {
            bankDetails,
            totalTransaction,
            openingBalance
          },
        };
      } else {
        response = {
          status: false,
          message: 'No Banking Data Found',
          data: null,
        };
      }
    } catch (error) {
     console.log(error)
     throw error
    }
    return response;
  }


  async getTransactions(id:number,dataObj:any){
    try {
      const transactions = await this.ledger_details.findAllByQuery({
        where: {
          adminid:id,
          companyid:dataObj.companyid,
          type:dataObj?.type,
          sdate: {
            [Op.gte]: dataObj.sdate,
            [Op.lte]: dataObj.ldate,
          },
          discount_status: {
            [Op.notIn]: [1],
          },
        },
        order: [['sdate', 'DESC']],
        include: [
          {
            model: AccountMaster,
            as: 'accountMasterDetails', // Change to a unique alias
        },
        ]
      });

      let dataList = [] ;
      for (let i = 0; i < transactions.length; i++) {
        const element = transactions[i];
        let customer = '';
        let business = '';
        let paidFrom = '';
        let paidTo = '';
        const details: any = await this.contactMasterService.getOne(
          Number(element.cname)
        );
        const ledger: any = await LedgerDetails.findOne<LedgerDetails>({
          where: { id : element?.id },
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
                await LedgerDetails.findOne<LedgerDetails>({
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

        if(element.paidfrom){
          const ledgerFrom = await this.account_details.findOne(Number(element.paidfrom));
          paidFrom = ledgerFrom?.data && ledgerFrom?.data?.laccount;
        }
       
        const ledgerTo = await this.account_details.findOne(Number(element.ledger));
        paidTo = ledgerTo?.data && ledgerTo?.data?.laccount;

        customer = details.data && details.data.cname;
        business = details.data && details.data.bus_name;

        let resData = {
          customer: customer,
          busname: business,
          id: element.id,
          baseid: element.baseid,
          date: element.sdate,
          amount: element.total,
          debit: element.debit,
          credit: element.credit,
          type: element.type,
          booleantype: element.booleantype,
          reconcile_status: element.reconcile_status,
          purchaseid: element.purchaseid,
          saleid: element.saleid,
          cname: element.cname,
          customer_name: element.customer_name,
          reference: element.reference,
          details: element.details,
          reconcile_date: element.reconcile_date,
          paidFrom:paidFrom,
          paidTo:paidTo,
          name:ledger?.name
        };
        dataList.push(resData);
      }
      return new CommonResponseDto(dataList,true,'Transaction list fetched successfully')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async listBankActivity(adminid, id, sdate, ldate) {
    let response: CommonResponseDto;
    sdate = new Date(sdate);
    ldate = new Date(new Date(ldate).setHours(23, 59, 59, 59));
    //const offset = req.params.offset;
    //const limit = req.params.limit;
    try {
      let ledgerDetails: any = await this.bankDetailsList(
        adminid,
        id,
        sdate,
        ldate,
      );

      let runningTotal = await this.getRemainingBalance(adminid, id, sdate);

      if (ledgerDetails) {
        let count = 0;
        let vatRate = 0;
        let netAmt = 0;
        let bankName = '';
        let resList = [];
        let elementList = [];
        let amount = 0;

        for (var i = 0; i < ledgerDetails.length; i++) {
          let customer = '';
          let business = '';
          let idType = ''; //EXTRA
          let element = ledgerDetails[i];
          count++;

          if (
            element.booleantype == '5' ||
            element.booleantype == '3' ||
            element.booleantype == '14' ||
            element.booleantype == '16' ||
            element.booleantype == '18' ||
            element.booleantype == '42' ||
            element.booleantype == '22' ||
            element.booleantype == '7' ||
            element.booleantype == '8'
          ) {
            if (element.booleantype == '14' || element.booleantype == '22') {
              const nCust: any = await this.contactMasterService.getOne(
                Number(element.cname),
                //adminid, //extra
              );
              customer = nCust.data && nCust.data.cname;
              business = nCust.data && nCust.data.bus_name;
              idType = 'Supplier';
              netAmt = Number(element.total);
              if (element.purchaseid) {
                const pList = await this.ledger_details.findAllByQuery({
                  where: {
                    used: 'group',
                    sdate: {
                      [Op.gt]: sdate,
                      [Op.lt]: ldate,
                    },
                    purchaseid: element.purchaseid,
                    is_deleted: false, //new
                  },
                });
                if (pList) {
                  pList.forEach((listElement) => {
                    vatRate += Number(listElement.incomeTaxAmount);
                    netAmt -= Number(listElement.incomeTaxAmount);
                  });
                }
              }
            } else if (
              element.booleantype == '5' ||
              element.booleantype == '3' ||
              element.booleantype == '42' ||
              element.booleantype == '7' ||
              element.booleantype == '8'
            ) {
              const nCust = await this.contactMasterService.getOne(
                Number(element.cname),
              );
              if (!nCust) {
                const ledger = await this.account_details.findOne(
                  element.ledger,
                );
              } else {
                customer = nCust ? nCust?.data?.name : '';
                business = nCust ? nCust?.data?.bus_name : '';
                idType = 'Customer';
              }

              if (element.saleid) {
                const pList = await this.ledger_details.findAllByQuery({
                  where: {
                    used: 'group',
                    sdate: {
                      [Op.gt]: sdate,
                      [Op.lt]: ldate,
                    },
                    saleid: element.saleid,
                    is_deleted: false, //new
                  },
                });
                if (pList) {
                  pList.forEach((listElement) => {
                    vatRate += Number(listElement.incomeTaxAmount);
                    netAmt -= Number(listElement.incomeTaxAmount);
                  });
                }
              }
            } else if (
              element.booleantype == '16' ||
              element.booleantype == '18'
            ) {
              const bName = await this.account_details.findByQuery(
                Number(element.paidfrom),
                {
                  where: {
                    adminid: adminid,
                  },
                },
              );
              bankName = bName && bName.laccount;
              customer = bName && bName.laccount;
            } else if (element.booleantype == '8') {
              const nCust: any = await this.contactMasterService.getOne(
                Number(element.cname),
              );
              customer = nCust.data && nCust.data.name;
              business = nCust.data && nCust.data.bus_name;
              idType = 'Supplier';
              netAmt = Number(element.total);
              if (element.purchaseid) {
                const pList = await this.ledger_details.findAllByQuery({
                  where: {
                    used: 'group',
                    sdate: {
                      [Op.gt]: sdate,
                      [Op.lt]: ldate,
                    },
                    purchaseid: element.purchaseid,
                    is_deleted: false, //new
                  },
                });
                if (pList) {
                  pList.forEach((listElement) => {
                    vatRate += Number(listElement.incomeTaxAmount);
                    netAmt -= Number(listElement.incomeTaxAmount);
                  });
                }
              }
            } else {
            }
            runningTotal = Number(runningTotal) + Number(element.total);
            let resData = {
              customer: customer,
              busname: business,
              bankname: bankName,
              id: element.id,
              date: element.sdate,
              amount: element.total,
              net: netAmt,
              vat: vatRate,
              debit: element.debit,
              credit: element.credit,
              type: element.type,
              booleantype: element.booleantype,
              reconcile_status: element.reconcile_status,
              purchaseid: element.purchaseid,
              saleid: element.saleid,
              cname: element.cname,
              customer_name: element.customer_name,
              reference: element.reference,
              details: element.details,
              journalid: element.journalid,
              runningTotal: Number(runningTotal).toFixed(2),
              payrollid: element.payrollid,
              idType: idType,
              reconcile_date: element.reconcile_date,
            };
            resList.push(resData);
          } else if (
            element.booleantype == '6' ||
            element.booleantype == '4' ||
            element.booleantype == '13' ||
            element.booleantype == '15' ||
            element.booleantype == '17' ||
            element.booleantype == '23'
          ) {
            if (element.booleantype == '6' || element.booleantype == '4') {
              const nCust = await this.contactMasterService.getOne(
                Number(element.cname),
              );
              customer = nCust && nCust.data.name;
              business = nCust && nCust.data.bus_name;
              idType = 'Supplier';
              netAmt = Number(element.total);
              if (element.purchaseid) {
                const pList = await this.ledger_details.findAllByQuery({
                  where: {
                    used: 'group',
                    sdate: {
                      [Op.gt]: sdate,
                      [Op.lt]: ldate,
                    },
                    purchaseid: element.purchaseid,
                    is_deleted: false, //new
                  },
                });
                if (pList) {
                  pList.forEach((listElement) => {
                    vatRate += Number(listElement.incomeTaxAmount);
                    netAmt -= Number(listElement.incomeTaxAmount);
                  });
                }
              }
            } else if (
              element.booleantype == '13' ||
              element.booleantype == '23'
            ) {
              const nCust = await this.contactMasterService.getOne(
                Number(element.cname),
              );
              customer = (nCust && nCust.data.name) || 'NA';
              business = (nCust && nCust.data.bus_name) || 'NA';
              idType = 'Customer';
              netAmt = Number(element.total);
              if (element.saleid) {
                const pList = await this.ledger_details.findAllByQuery({
                  where: {
                    used: 'group',
                    sdate: {
                      [Op.gt]: sdate,
                      [Op.lt]: ldate,
                    },
                    saleid: element.saleid,
                    is_deleted: false, //new
                  },
                });
                if (pList) {
                  pList.forEach((listElement) => {
                    vatRate += Number(listElement.incomeTaxAmount);
                    netAmt -= Number(listElement.incomeTaxAmount);
                  });
                }
              }
            } else if (
              element.booleantype == '15' ||
              element.booleantype == '17'
            ) {
              const bName = await this.account_details.findByQuery(
                Number(element.paidfrom),
                {
                  where: {
                    adminid: adminid,
                  },
                },
              );
              bankName = bName && bName.laccount;
              customer = bName && bName.laccount;
            } else {
              console.log('Checking');
            }
            runningTotal = Number(runningTotal) + Number(element.total);
            let resData = {
              customer: customer,
              busname: business,
              bankname: bankName,
              id: element.id,
              date: element.sdate,
              amount: element.total,
              net: netAmt,
              vat: vatRate,
              debit: element.debit,
              credit: element.credit,
              type: element.type,
              booleantype: element.booleantype,
              reconcile_status: element.reconcile_status,
              purchaseid: element.purchaseid,
              saleid: element.saleid,
              payrollid: element.payrollid,
              cname: element.cname,
              customer_name: element.customer_name,
              reference: element.reference,
              details: element.details,
              journalid: element.journalid,
              runningTotal: Number(runningTotal).toFixed(2),
              idType: idType,
              reconcile_date: element.reconcile_date,
            };
            elementList.push(element);
            resList.push(resData);
          } else if (element.booleantype == '19') {
            runningTotal = Number(runningTotal) + Number(element.total);
            let resData = {
              customer: customer,
              busname: business,
              bankname: bankName,
              id: element.id,
              date: element.sdate,
              amount: element.total,
              net: netAmt,
              vat: vatRate,
              debit: element.debit,
              credit: element.credit,
              type: element.type,
              booleantype: element.booleantype,
              reconcile_status: element.reconcile_status,
              purchaseid: element.purchaseid,
              saleid: element.saleid,
              cname: element.cname,
              customer_name: element.customer_name,
              reference: element.reference,
              details: element.details,
              journalid: element.journalid,
              runningTotal: Number(runningTotal).toFixed(2),
              idType: idType,
              payrollid: element.payrollid,
            };
            resList.push(resData);
          }
        }

        const bankInfo = await this.account_details.findById(id);
        response = {
          status: true,
          message: 'Bank Activity List',
          data: {
            resList,
            bankInfo,
            ledgerDetails,
            elementList,
          },
        };
      } else {
        response = {
          status: false,
          message: 'No data Found',
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      throw error
    }
    return response;
  }

  async listBankActivityList(
    adminid,
    id,
    pageOptionsDto,
    ldate: any,
    sdate: any,
  ) {
    let response: CommonResponseDto;
    const skip =
      (Number(pageOptionsDto.page) - 1) * Number(pageOptionsDto.take);
    try {
      let startdate = new Date(new Date(sdate).setHours(0, 0, 0, 0));
      let enddate = new Date(new Date(ldate).setHours(23, 59, 59, 59));

      let endTotal = new Date(new Date(sdate).setHours(0, 0, 0, 0));
      const currentBeforeDate = await this.ledger_details.findAllByQuery({
        where: {
          adminid: adminid,
          ledger: id,
          is_deleted: false,
          sdate: {
            [Op.gte]: '2000-01-31T18:30:00.000Z',
            [Op.lte]: endTotal,
          },
        },
      });

      let openingBalance = 0;
      let Debit = currentBeforeDate.reduce((total: any, item: any) => {
        return total + Number(item.debit);
      }, 0);

      let Credit = currentBeforeDate.reduce((total: any, item: any) => {
        return total + Number(item.credit);
      }, 0);

      openingBalance = Number(Debit) - Number(Credit);

      const ledgerDetails = await this.ledger_details.findAllByQuery({
        where: {
          adminid: adminid,
          ledger: id,
          is_deleted: false,
          sdate: {
            [Op.gte]: startdate,
            [Op.lte]: enddate,
          },

          discount_status: {
            [Op.ne]: [1],
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
            '73',
          ],
        },
        // offset: Number(skip),
        order: [['sdate', pageOptionsDto.order]],
        // limit: Number(pageOptionsDto.take),
      });
      if(!ledgerDetails.length){
        return response = {
          status: false,
          message: 'There is no cash activity list.',
          data: {openingBalance},
        };
      }
      let runningTotal = await this.getRemainingBalance(
        adminid,
        id,
        '01-01-1990',
      );
      if (ledgerDetails && ledgerDetails.length > 0) {
        let count = 0;
        let vatRate = 0;
        let netAmt = 0;
        let resList = [];
        let elementList = [];
        for (let index in ledgerDetails) {
          let element: any = ledgerDetails[index];
          let resData = {
            ...element,
          };
          count++;
          if (
            element.booleantype == '14' ||
            element.booleantype == '22' ||
            element.booleantype == '8' ||
            element.booleantype == '6' ||
            element.booleantype == '4' ||
            element.booleantype == '5' ||
            element.booleantype == '3' ||
            element.booleantype == '42' ||
            element.booleantype == '7' ||
            element.booleantype == '13' ||
            element.booleantype == '23'
          ) {
            const nCust = await this.contactMasterService.getOne(
              Number(element.cname),
            );

            resData['customer'] = nCust && nCust.data.bus_name;
            resData['business'] = nCust && nCust.data.name;
            resData['idType'] = 'Supplier';
            netAmt = Number(element.total);
            if (element.purchaseid) {
              const pList = await this.ledger_details.findAllByQuery({
                where: {
                  used: 'group',
                  purchaseid: element.purchaseid,
                },
              });
              if (pList) {
                pList.forEach((listElement) => {
                  vatRate += Number(listElement.incomeTaxAmount);
                  netAmt -= Number(listElement.incomeTaxAmount);
                });
              }
            }
            runningTotal = Number(runningTotal) + Number(element.total);
            resList.push(resData);
          } else if (
            element.booleantype == '16' ||
            element.booleantype == '18' ||
            element.booleantype == '15' ||
            element.booleantype == '17'
          ) {
            if (element.paidfrom == element.ledger) {
              if (element.baseid) {
                let getLedger: any = await this.ledger_details.findAllByQuery({
                  where: {
                    id: Number(element.baseid),
                  },
                });
                let bName = await this.account_details.findByQuery(
                  Number(getLedger[0].ledger),
                  {
                    where: {
                      adminid: adminid,
                    },
                  },
                );
                resData['bankName'] = bName?.laccount || 55;
                resData['customer'] = bName?.laccount || '55';
                resList.push(resData);
              } else {
                let getLedger: any = await this.ledger_details.findAllByQuery({
                  where: {
                    id: Number(element.id) + 1,
                  },
                });
                if (getLedger.length) {
                  let bName = await this.account_details.findByQuery(
                    Number(getLedger[0].ledger),
                    {
                      where: {
                        adminid: adminid,
                      },
                    },
                  );
                  resData['bankName'] = bName?.laccount;
                  resData['customer'] = bName?.laccount;
                  resList.push(resData);
                }
              }
            } else {
              let bName = await this.account_details.findByQuery(
                Number(element.paidfrom),
                {
                  where: {
                    adminid: adminid,
                  },
                },
              );
              resData['bankName'] = bName?.laccount;
              resData['customer'] = bName?.laccount;
              resList.push(resData);
            }
            runningTotal = Number(runningTotal) + Number(element.total);
          } else if (element.booleantype == '97') {
            let getLedger: any = await this.ledger_details.findAllByQuery({
              where: {
                baseid: element.id,
              },
            });
            const nCust: any = await this.account_details.findOneQuery(
              Number(getLedger[0].ledger),
            );
            resData['bankName'] = nCust && nCust.laccount;
            resData['customer'] = nCust && nCust.laccount;
            runningTotal = Number(runningTotal) + Number(element.total);
            resList.push(resData);
          } else if (element.booleantype == 73) {
            let employee = await this.employee_service.findOneById(element.employeeid);
            resData['customer'] = employee && employee.lastName;
            resList.push(resData);
          } else {
            console.log('Checking');
          }
        }

        const bankInfo = await this.account_details.findById(id);
        response = {
          status: true,
          message: 'Bank Activity List',
          data: {
            resList,
            bankInfo,
            ledgerDetails,
            elementList,
            openingBalance,
          },
        };
      } else {
      }
    } catch (error) {
      console.log(error);
      throw error
    }

    return response;
  }

  async listBankActivityList2(
    adminid,
    id,
    pageOptionsDto,
    ldate: any,
    sdate: any,
  ) {
    let response: CommonResponseDto;
    let startDate = new Date(sdate);
    const startOfDay = moment(startDate).startOf('day').toISOString();
    let endDate = new Date(ldate);
    const endOfDay = moment(endDate).endOf('day').toISOString();

    const skip =
      (Number(pageOptionsDto.page) - 1) * Number(pageOptionsDto.take);
    try {
      const ledgerDetails = await this.ledger_details.findAllByQuery({
        where: {
          adminid: adminid,
          ledger: id,
          is_deleted: false,
          discount_status: {
            [Op.notIn]: [1],
          },
          sdate: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          booleantype: [
            '5',
            '3',
            '14',
            '16',
            '18',
            '42',
            '22',
            '7',
            '8',
            '6',
            '4',
            '13',
            '15',
            '17',
            '23',
            '97',
            '73',
          ],
        },
        // offset: Number(skip),
        // limit: Number(pageOptionsDto.take),
        order: [['sdate', 'DESC']],
      });

      let endTotal = new Date(new Date(sdate).setHours(0, 0, 0, 0));
      const currentBeforeDate = await this.ledger_details.findAllByQuery({
        where: {
          adminid: adminid,
          ledger: id,
          is_deleted: false,
          sdate: {
            [Op.gte]: '2000-01-31T18:30:00.000Z',
            [Op.lte]: endTotal,
          },
        },
      });

      let openingBalance = 0;
      let Debit = currentBeforeDate.reduce((total: any, item: any) => {
        return total + Number(item.debit);
      }, 0);

      let Credit = currentBeforeDate.reduce((total: any, item: any) => {
        return total + Number(item.credit);
      }, 0);

      openingBalance = Number(Debit) - Number(Credit);

      const ledgerDetailsBank = await this.ledger_details.findAllByQuery({
        where: {
          adminid: adminid,
          ledger: id,
          is_deleted: false,
          sdate: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },

          discount_status: {
            [Op.ne]: [1],
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
            '73',
          ],
        },
        offset: Number(skip),
        order: [['sdate', pageOptionsDto.order]],
        limit: Number(pageOptionsDto.take),
      });

      let runningTotal = await this.getRemainingBalance(
        adminid,
        id,
        '01-01-1990',
      );
      if (ledgerDetails && ledgerDetails.length > 0) {
        let count = 0;
        let vatRate = 0;
        let netAmt = 0;
        let resList = [];
        let elementList = [];
        for (let index in ledgerDetails) {
          let element: any = ledgerDetails[index];
          let resData = {
            adminid: element.adminid,
            customer: '',
            busname: '',
            bankname: '',
            id: element.id,
            date: element.sdate,
            amount: element.total,
            net: netAmt,
            vat: vatRate,
            debit: element.debit,
            credit: element.credit,
            type: element.type,
            booleantype: element.booleantype,
            reconcile_status: element.reconcile_status,
            purchaseid: element.purchaseid,
            saleid: element.saleid,
            cname: element.cname,
            reference: element.reference,
            details: element.details,
            journalid: element.journalid,
            runningTotal: element.running_total,
            reconcile_date: element.reconcile_date,
            idType: '',
            payrollid: element.payrollid,
          };
          count++;
          if (
            element.booleantype == '14' ||
            element.booleantype == '22' ||
            element.booleantype == '22' ||
            element.booleantype == '5' ||
            element.booleantype == '3' ||
            element.booleantype == '42' ||
            element.booleantype == '7' ||
            element.booleantype == '8' ||
            element.booleantype == '6' ||
            element.booleantype == '4' ||
            element.booleantype == '13' ||
            element.booleantype == '23'
          ) {
            const nCust = await this.contactMasterService.getOne(
              Number(element.cname),
            );

            resData['customer'] = nCust && nCust?.data?.bus_name;
            resData['business'] = nCust && nCust?.data?.name;
            resData['idType'] = 'Supplier';
            netAmt = Number(element.total);
            if (element.purchaseid) {
              const pList = await this.ledger_details.findAllByQuery({
                where: {
                  used: 'group',
                  purchaseid: element.purchaseid,
                },
              });
              if (pList) {
                pList.forEach((listElement) => {
                  vatRate += Number(listElement.incomeTaxAmount);
                  netAmt -= Number(listElement.incomeTaxAmount);
                });
              }
            }
            runningTotal = Number(runningTotal) + Number(element.total);
            resList.push(resData);
          } else if (
            element.booleantype == '16' ||
            element.booleantype == '18' ||
            element.booleantype == '15' ||
            element.booleantype == '17'
          ) {
            if (element.paidfrom == element.ledger) {
              if (element.baseid) {
                let getLedger: any = await this.ledger_details.findAllByQuery({
                  where: {
                    id: Number(element.baseid),
                  },
                });
                let bName = await this.account_details.findByQuery(
                  Number(getLedger[0].ledger),
                  {
                    where: {
                      adminid: adminid,
                    },
                  },
                );
                resData['bankName'] = bName?.laccount;
                resData['customer'] = bName?.laccount;
                resList.push(resData);
              } else {
                let getLedger: any = await this.ledger_details.findAllByQuery({
                  where: {
                    id: Number(element.id) + 1,
                  },
                });
                if (getLedger.length) {
                  let bName = await this.account_details.findByQuery(
                    Number(getLedger[0].ledger),
                    {
                      where: {
                        adminid: adminid,
                      },
                    },
                  );
                  resData['bankName'] = bName?.laccount;
                  resData['customer'] = bName?.laccount;
                  resList.push(resData);
                }
              }
            } else {
              let bName = await this.account_details.findByQuery(
                Number(element.paidfrom),
                {
                  where: {
                    adminid: adminid,
                  },
                },
              );
              resData['bankName'] = bName?.laccount;
              resData['customer'] = bName?.laccount;
              resList.push(resData);
            }
            runningTotal = Number(runningTotal) + Number(element.total);
          } else if (element.booleantype == '97') {
            let getLedger: any = await this.ledger_details.findAllByQuery({
              where: {
                baseid: element.id,
              },
            });
            const nCust: any = await this.account_details.findOneQuery(
              Number(getLedger[0].ledger),
            );
            resData['bankName'] = nCust && nCust.laccount;
            resData['customer'] = nCust && nCust.laccount;
            runningTotal = Number(runningTotal) + Number(element.total);
            resList.push(resData);
          } else if (element.booleantype == 73) {
            let employee = await this.employee_service.findOneById(element.employeeid);
            resData['customer'] = employee && employee.lastName;
            resList.push(resData);
          } else {
            console.log('Checking');
          }
        }
        const bankInfo = await this.account_details.findById(id);
        response = {
          status: true,
          message: 'Bank Activity List',
          data: {
            resList,
            bankInfo,
            ledgerDetails,
            elementList,
            openingBalance,
          },
        };
      } else {
        response = {
          status: false,
          message: 'No Data',
          data: {openingBalance},
        };
      }
    } catch (error) {
      console.log('error:', error);
      throw error
    }
    return response;
  }

  async bankDetailsList(adminid, id, sdate, ldate) {
    try {
      let startdate = new Date(sdate)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    let enddate = new Date(ldate).toISOString().slice(0, 19).replace('T', ' ');
    const ledgerDetails = await this.ledger_details.findAllByQuery({
      where: {
        adminid: adminid,
        ledger: id,
        sdate: {
          [Op.gte]: startdate,
          [Op.lte]: enddate,
        },
        discount_status: {
          [Op.notIn]: [1],
        },
        is_deleted: false,
      },
      order: [['sdate', 'DESC']],
    });
    if (ledgerDetails) {
      return ledgerDetails;
    } else {
      return false;
    }
    } catch (error) {
      console.log(error)
      throw error
    }
    
  }

  async getRemainingBalance(adminid, id, sdate) {
    try {
      const getAllTransaction = await this.ledger_details.findAllByQuery({
        where: {
          adminid: adminid,
          ledger: id,
          sdate: {
            [Op.lt]: sdate,
          },
          status: {
            [Op.ne]: 4,
          },
          discount_status: {
            [Op.ne]: 1,
          },
        },
      });
      let totalSum = 0;

      const getOpeningBalance = await this.account_details.findById(id);
      if (getOpeningBalance) {
        totalSum = getOpeningBalance.opening || 0;
      }
      if (getAllTransaction) {
        getAllTransaction.forEach((element) => {
          totalSum = Number(totalSum) + Number(element.total);
        });
        return Number(totalSum).toFixed(2);
      } else {
        return 0;
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getBankingTransactionDetail(entryid, adminid) {
    let response: CommonResponseDto;
    try {
      let query = {
        adminid: adminid,
        id: entryid,
        [Op.or]: [
          {
            discount_status: null,
          },
          {
            discount_status: {
              [Op.ne]: 1,
            },
          },
        ],
      };
      const getTransaction = await this.ledger_details.findAllByQuery({
        where: query,
        include: [
          { model: AccountMaster, as: 'accountMasterDetails' },
          { model: SaleInvoice, as: 'sale' },
          { model: PurchaseInvoice, as: 'purchase' },
        ],
      });
      let AllData: any[] = [];

      for (const transaction of getTransaction) {
        const customerName = Number(transaction.cname);
        const { data }: any = await this.contactMasterService.getOne(
          customerName,
        );
        const name = data?.name;

        const tdata = {
          ...transaction,
          name,
        };
        AllData.push(tdata);
      }
      if (getTransaction) {
        response = {
          status: true,
          message: 'Banking Transaction Details',
          data: AllData,
        };
      } else {
        response = {
          status: true,
          message: 'No Data Found',
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
      throw error
    }
    return response;
  }
  async bankTransfer(req: any) {
    let response: CommonResponseDto;
    try {
      await this.databaseService.getSequelize.transaction(
        async (transaction) => {
          if (req.type && req.type == '1') {
            let fromBank = await this.account_details.findById(req.paidfrom);
            let toBank = await this.account_details.findById(req.paidto);
            if (fromBank && toBank) {
              let fromAmount = fromBank.total;
              let toAmount = toBank.total;
              fromAmount = Number(fromAmount) - Number(req.amount);
              toAmount = Number(toAmount) + Number(req.amount);
              let fromData = {
                total: Number(fromAmount).toFixed(2),
                userdate: new Date(),
                updatedAt: new Date(),
              };
              let toData = {
                total: Number(toAmount).toFixed(2),
                userdate: new Date(),
                updatedAt: new Date(),
              };
              let totalAvailableBalance = await this.getBankDetails(
                req.paidfrom,
                req.adminid,
              );
              let balance =
                Number(totalAvailableBalance.data.bankDetails.opening) +
                Number(totalAvailableBalance.data.bankDetails.total);
              let paidfromrunningtotal = Number(balance) - Number(req.amount);

              let paidtoBalnce = await this.getBankDetails(
                req.paidto,
                req.adminid,
              );
              let paidtobalance =
                Number(paidtoBalnce.data.bankDetails.opening) +
                Number(paidtoBalnce.data.bankDetails.total);
              let paidtorunningtotal =
                Number(paidtobalance) - Number(req.amount);

              const updateFrom = await this.account_details.update(
                req.paidfrom,
                fromData,
              );
              const updateTo = await this.account_details.update(
                req.paidto,
                toData,
              );
              let paid =
                req.ledger === req.paidfrom ? req.paidto : req.paidfrom;


                let otherDataObj = {
                  adminId:req.adminid,
                  companyId:req.companyid,
                  total:req.amount,
                  cname:req.cname,
                  ledgerId:req?.paidfrom,
                  bankid:paid,
                  reference:req.reference,
                  createdBy:req.createdBy,
                  date: req.sdate,
                  type:'Bank Transfer'
                };
        
                const otherData = await this.otherMasterService.create(otherDataObj);

              var data = {
                ledger: req.paidfrom,
                ledgercategory: '1',
                paidfrom: paid,
                sdate: req.sdate,
                reference: req.reference,
                total: '-' + req.amount,
                userid: req.userid,
                paidmethod: req.paidmethod,
                type: 'Bank Transfer',
                details: req.description,
                userdate: new Date(),
                credit:  req.amount,//0,
                debit: 0,// req.amount,
                otherid:otherData.data.id,
                discount_status: '0',
                booleantype: '15',
                usertype: 'bank transfer',
                adminid: req.adminid,
                description: req.description,
                running_total: paidfromrunningtotal,
                createdBy:req.createdBy,
                companyid:req.companyid
              };

              const ledgerData = await this.ledger_details.create(
                data,
                transaction,
              );

              var data1 = {
                baseid: ledgerData.id,
                paidfrom: paid,
                ledger: req.paidto,
                ledgercategory: '1',
                sdate: req.sdate,
                reference: req.reference,
                total: req.amount,
                userid: req.userid,
                paidmethod: req.paidmethod,
                type: 'Bank Transfer',
                details: req.description,
                userdate: new Date(),
                otherid:otherData.data.id,
                credit:0 ,
                debit: req.amount,
                discount_status: '0',
                booleantype: '16',
                usertype: 'bank transfer',
                adminid: req.adminid,
                updatedAt: new Date(),
                transferid: ledgerData.id,
                description: req.description,
                running_total: paidtorunningtotal,
                createdBy:req.createdBy,
                companyid:req.companyid
              };
              const ledgerData1 = await this.ledger_details.create(
                data1,
                transaction,
              );

              response = {
                status: true,
                message: 'Bank Transfer Completed',
                data: null,
              };
            } else {
              response = {
                status: false,
                message: 'Bank Transfer Failed',
                data: null,
              };
            }
          } else {
            const transferid = req.id;
            var data2 = {
              paidfrom: req.paidfrom,
              sdate: req.sdate,
              ledger: req.paidfrom,
              reference: req.reference,
              total: '-' + req.amount,
              paidmethod: req.paidmethod,
              userdate: new Date(),
              debit: 0,
              credit: req.amount,
              adminid: req.adminid,
              updatedAt: new Date(),
              createdBy:req.createdBy,
              companyid:req.companyid
            };

            var data3 = {
              paidfrom: req.paidto,
              ledger: req.paidto,
              sdate: req.sdate,
              reference: req.reference,
              total: req.amount,
              paidmethod: req.paidmethod,
              details: req.description,
              userdate: new Date(),
              credit: 0,
              debit: req.amount,
              adminid: req.adminid,
              updatedAt: new Date(),
              createdBy:req.createdBy,
              companyid:req.companyid
            };

            var $result3: any = await this.ledger_details.findById(transferid);

            var $totalamount = -$result3.total;
            var $received = $result3.paidfrom;
            var $totalamount3 = Number(req.amount) - Number($totalamount);
            var $result4 = await this.account_details.findById(req.paidfrom);
            var $totalamount4 = $result4.total;
            var $totalamountminus =
              Number($totalamount4) - Number($totalamount3);
            var $result5 = await this.account_details.findById(req.paidto);
            var $totalamount5 = $result5.total;
            var $result6 = await this.account_details.findById($received);
            var $totalamountplus = 0;
            var $receivedamount = 0;
            if ($received != req.paidto) {
              $totalamountplus = Number($totalamount5) + Number(req.amount);
              $receivedamount = Number($result6.total) - Number($totalamount);
            } else {
              $totalamountplus = Number($totalamount5) + Number($totalamount3);
              $receivedamount = Number($totalamountplus);
            }

            var $data6 = {
              total: Number($totalamountminus).toFixed(2),
              userdate: new Date(),
              updatedAt: new Date(),
            };
            var $data7 = {
              total: Number($totalamountplus).toFixed(2),
              userdate: new Date(),
              updatedAt: new Date(),
            };
            var $data8 = {
              total: Number($receivedamount).toFixed(2),
              userdate: new Date(),
              updatedAt: new Date(),
            };

            const updateFrom = await this.account_details.update(
              req.paidfrom,
              $data6,
            );

            const updateTo = await this.account_details.update(
              req.paidto,
              $data7,
            );

            const updateReceived = await this.account_details.update(
              $received,
              $data8,
            );

            const updateledgerData = await this.ledger_details.updateByQuery(
              data2,
              {
                where: {
                  id: transferid,
                },
              },
            );

            const updateledgerData1 = await this.ledger_details.updateByQuery(
              data3,
              {
                where: {
                  transferid: transferid,
                },
              },
            );

            response = {
              status: true,
              message: 'Bank Transfer Updated Successfully',
              data: [],
            };
          }
        },
      );
    } catch (error) {
      console.log(error);
      throw error
    }
    return response;
  }

  async bankTransferView(id: number) {
    let response: CommonResponseDto;
    try {
      const bankTransferDetails = await this.ledger_details.findById(id);

      if (bankTransferDetails) {
        response = {
          status: true,
          message: 'Bank Transfer Details',
          data: bankTransferDetails,
        };
      } else {
        response = {
          status: false,
          message: 'Bank Transfer Details Not Available',
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
      throw error
    }
    return response;
  }

  async viewTransfer(id: number) {
    let response: CommonResponseDto;
    try {
      let bankTransferDetailsFrom = await this.ledger_details.findById(id);
      if (bankTransferDetailsFrom) {
        let bankTransferDetailsTo = await this.ledger_details.findOneByQuery({
          where: {
            baseid: id,
            type: 'Bank Transfer',
          },
        });
        if (!bankTransferDetailsTo && bankTransferDetailsFrom.baseid) {
          bankTransferDetailsTo = bankTransferDetailsFrom;
          bankTransferDetailsFrom = await this.ledger_details.findById(
            Number(bankTransferDetailsFrom.baseid),
          );
        }
        const fromBank = await this.account_details.findById(
          bankTransferDetailsFrom.ledger,
        );
        const toBank = await this.account_details.findById(
          bankTransferDetailsTo.ledger,
        );
        const data = {
          transferDetails: bankTransferDetailsFrom,
          fromBank: fromBank,
          toBank: toBank,
        };
        response = {
          status: true,
          message: 'Bank Transfer Details',
          data,
        };
      } else {
        response = {
          status: false,
          message: 'Data Not Found',
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
     throw error
    }
    return response;
  }

  async deleteBankTransfer(req: any) {
    let response: CommonResponseDto;
    try {
      let transferInfoBase = await this.ledger_details.findById(req.id);
      if (transferInfoBase) {
        let baseid = '';
        let transferInfo;
        if (transferInfoBase.baseid == '' || !transferInfoBase.baseid) {
          transferInfo = await this.ledger_details.findOneByQuery({
            where: {
              baseid: req.id,
            },
          });
        } else {
          transferInfo = await this.ledger_details.findById(
            Number(transferInfoBase.baseid),
          );
        }
        if (transferInfo) {
          let fromBank = await this.account_details.findById(
            transferInfoBase.dataValues.ledger,
          );
          let toBank = await this.account_details.findById(
            transferInfo.dataValues.ledger,
          );
          let fromAmount = fromBank.total;
          let toAmount = toBank.total;
          fromAmount = Number(fromAmount) - Number(req.item.amount);
          toAmount = Number(toAmount) + Number(req.item.amount);
          let fromData: any = {
            total: Number(fromAmount).toFixed(2),
            userdate: new Date(),
            updatedAt: new Date(),
          };
          let toData: any = {
            total: Number(toAmount).toFixed(2),
            userdate: new Date(),
            updatedAt: new Date(),
          };

          const updateFrom = await this.account_details.update(
            Number(transferInfoBase.dataValues.ledger),
            fromData,
          );
          const updateTo = await this.account_details.update(
            Number(transferInfo.dataValues.ledger),
            toData,
          );
          let destroyData = this.ledger_details.distroy({
            where: {
              id: transferInfoBase.dataValues.id,
            },
          });
          if (destroyData) {
            let destroyData2 = this.ledger_details.distroy({
              where: {
                id: transferInfo.dataValues.id,
              },
            });
            if (destroyData2) {
              response = {
                status: true,
                message: 'Bank Transfer Deleted',
                data: [],
              };
            }
          } else {
            response = {
              status: false,
              message: 'Bank Updated without deleting Transaction Properly',
              data: [],
            };
          }
        }
      } else {
        response = {
          status: false,
          message: 'Bank Details Not Found',
          data: transferInfoBase,
        };
      }
    } catch (error) {
      console.log(error);
      throw error
    }
    return response;
  }

  
  async listSupplierRefund(id, adminid) {
    let response: CommonResponseDto;
    try {
      const ledgerDetailsData: any = await this.ledger_details.findAllByQuery({
        where: {
          cname: id,
          adminid: adminid,
          type: 'Supplier Receipt',
          used: 'nonused',
          discount_status: {
            [Op.ne]: '1',
          },
          status: {
            [Op.ne]: '2',
          },
        },
        order: [['id', 'DESC']],
      });

      if (ledgerDetailsData) {
        let returnList = [];
        let count = 0;
        ledgerDetailsData.forEach((element) => {
          count++;
          let outstanding = Number(element.total) + Number(element.usedamount);
          let dataAry = {
            date: element.sdate,
            reference: element.reference,
            type: element.type,
            total: element.total,
            outstanding,
            status: element.status,
            id: element.id,
            bankid: element.ledger,
          };
          returnList.push(dataAry);
        });
        if (count === ledgerDetailsData.length) {
          response = {
            status: true,
            message: 'Supplier Receipt List',
            data: returnList,
          };
        }
      } else {
        response = {
          status: false,
          message: 'No Supplier Receipt Found',
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      throw error
    }
    return response;
  }

  async listCustomerRefund(id, userid) {
    let response: CommonResponseDto;
    try {
      const ledgerDetailsData = await this.ledger_details.findAllByQuery({
        where: {
          cname: id,
          userid: userid,
          type: ['Customer Receipt', 'Customer Reciept'],
          used: 'nonused',
          discount_status: {
            [Op.ne]: '1',
          },
          status: {
            [Op.ne]: '2',
          },
        },
        order: [['id', 'DESC']],
      });

      if (ledgerDetailsData) {
        response = {
          status: true,
          message: 'Customer Refund List',
          data: ledgerDetailsData,
        };
      } else {
        response = {
          status: false,
          message: 'No Customer Refund Found',
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
     throw error
    }
    return response;
  }
  async updatelistBankActivity(id: number, adminid: number) {
    try {
      const user = await this.ledger_details.findById(id);
      if (user && user) {
        return user;
      }
    } catch (error) {
      console.log(error);
      throw error
    }
  }
}
