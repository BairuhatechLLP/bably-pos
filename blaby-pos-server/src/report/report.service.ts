import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import numberToWords from "number-to-words";
import { Op, Sequelize } from "sequelize";
import { AccountMasterService } from "../account_master/account_master_service";
import { ContactMasterService } from "../contactMaster/contactMasterService";
import { CountriesService } from "../countries/countries_service";
import { InvoiceItemsService } from "../invoice_item/invoice_item_service";
import { LedgerCategoryService } from "../ledger_category/ledger_category_service";
import { LedgerDetailsService } from "../ledger_details/ledger_details_service";
import { ProductMasterService } from "../product_master/product_master_service";
import { PurchaseInvoiceService } from "../purchase_invoice/purchase_invoice_service";
import { SalesInvoiceService } from "../sale_invoice/sale_invoice_service";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { TaxService } from "../tax_master/tax_master_service";
import { UserService } from "../users/user.services";
import { StockSummaryService } from "./stockSummary.service";
import { AccountMaster } from "../account_master/account_master";
import { StaffTransactionsService } from "../staff_transactions/staff_transactions_service";
import sequelize from "sequelize";



const moment = require("moment");
const AWS = require("aws-sdk");
let awsConfig = {
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: "eu-west-1",
};
AWS.config.update(awsConfig);
const fs = require("fs");
// const InvoiceMail = require("../../mail/invoice-mail");
const s3_ = new AWS.S3();
const Mustache = require("mustache");
const path = require("path");

@Injectable()
export class ReportService {
  @Inject(forwardRef(() => AccountMasterService))
  private readonly account_master: AccountMasterService;

  @Inject(LedgerDetailsService)
  private readonly ledger_details: LedgerDetailsService;

  @Inject(ContactMasterService)
  private readonly contactMasterService: ContactMasterService;

  @Inject(LedgerCategoryService)
  private readonly ledgerCategory: LedgerCategoryService;

  @Inject(forwardRef(() => UserService))
  private readonly user: UserService;

  @Inject(CountriesService)
  private readonly countries: CountriesService;

  @Inject(SalesInvoiceService)
  private readonly sale_invoice: SalesInvoiceService;

  @Inject(PurchaseInvoiceService)
  private readonly purchase_invoice: PurchaseInvoiceService;

  @Inject(TaxService)
  private readonly tax_master: TaxService;

  @Inject(InvoiceItemsService)
  private readonly invoiceItemsService: InvoiceItemsService;

  @Inject(ProductMasterService)
  private readonly productMasterService: ProductMasterService;

  @Inject(StockSummaryService)
  private readonly stock_summary: StockSummaryService;

  @Inject( StaffTransactionsService)
  private readonly StaffTransactionsService: StaffTransactionsService;

  constructor(
    @Inject('SEQUELIZE') 
    private readonly sequelize : Sequelize
  ) {}

  async trialbalanceForPeriod(
    adminid: number,
    sdate: string,
    ldate: string,
    companyid: number
  ) {
    let response: CommonResponseDto;
    const startdate = moment(sdate).startOf("day").toISOString();
    const enddate = moment(ldate).endOf("day").toISOString();

    try {
      const ledgersList = await this.account_master.findAllByQuery({
        attributes: ["id", "laccount", "nominalcode", "opening"],
        where: {
          userid: {
            [Op.in]: ["-2", adminid],
          },
        },
        order: [["id", "DESC"]],
      });

      let trialLedgerList = [];
      let totalDebtors1 = 0;
      let totalCredit1 = 0;
      if (ledgersList.length > 0) {
        for (var i = 0; i < ledgersList.length; i++) {
          let element = ledgersList[i];

          let Lists = await this.ledger_details.findAllByQuery({
            where: {
              adminid: adminid,
              sdate: {
                [Op.gte]: startdate,
                [Op.lte]: enddate,
              },
              ledger: element.id,
              companyid,
            },
          });

          if (Lists.length > 0) {
            let totalAMT = 0;
            for (var a = 0; a < Lists.length; a++) {
              totalAMT =
                Number(totalAMT) +
                Number(Lists[a].credit) -
                Number(Lists[a].debit);
              // }
            }
            let credit = 0;
            let debit = 0;

            if (Number(totalAMT) > 0) {
              debit = 0;
              credit = Number(totalAMT); //+ element.opening;
              totalCredit1 = Number(totalCredit1) + Number(credit);
            } else {
              debit = Number(totalAMT); //+ element.opening;
              credit = 0;
              totalDebtors1 = Number(totalDebtors1) + Number(debit);
            }
            let data = {
              laccount: element.laccount,
              nominalcode: element.nominalcode,
              lid: element.id,
              debit: Number(debit).toFixed(2),
              credit: Number(credit).toFixed(2),
              type: element.type,
              opening: element.opening,
            };
            trialLedgerList.push(data);
          }

          if (ledgersList.length == i + 1) {
            let reponse = {
              ledgers: trialLedgerList,
              debtotal: Math.abs(totalDebtors1),
              credtotal: Math.abs(totalCredit1),
            };
            response = {
              status: true,
              message: "Trial Balance for the chosen period",
              data: reponse,
            };
          }
        }
      } else {
        response = {
          status: false,
          message: "No Data Found",
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async agedebtors(adminid, startdate) {
    let response: CommonResponseDto;
    let date = startdate;
    try {
      const getCustomers = await this.contactMasterService.findAllByQuery({
        where: {
          adminid: adminid,
          contractors_type: "customer",
        },
        order: [["id", "asc"]],
      });
      if (getCustomers) {
        let debval = [];
        let creval = [];
        let creTotal30 = 0;
        let creTotal60 = 0;
        let creTotal90 = 0;
        let creTotal120 = 0;
        let creTotalOLD = 0;
        let creTotalOut = 0;
        for (var i = 0; i < getCustomers.length; i++) {
          let element = getCustomers[i];

          let agedeb = await this.listagedebit(adminid, element.id, date);
          let debage = {
            cname: element.name,
            id: element.id,
            age: agedeb,
            cData: element,
          };
          creTotal30 += Math.abs(agedeb["total30"]);
          creTotal60 += Math.abs(agedeb["total60"]);
          creTotal90 += Math.abs(agedeb["total90"]);
          creTotal120 += Math.abs(agedeb["total120"]);
          creTotalOLD += Math.abs(agedeb["totalOLD"]);
          creTotalOut += Math.abs(agedeb["outstanding"]);
          debval.push(debage);
        }

        let creTotal = {
          total30: Number(creTotal30).toFixed(2),
          total60: Number(creTotal60).toFixed(2),
          total90: Number(creTotal90).toFixed(2),
          total120: Number(creTotal120).toFixed(2),
          totalOLD: Number(creTotalOLD).toFixed(2),
          outstanding: Number(creTotalOut).toFixed(2),
        };
        response = {
          status: true,
          message: "Aged Debitors List",
          data: {
            debval,
            totalVal: creTotal,
          },
        };
      } else {
        response = {
          status: false,
          message: "No Debtors Details Avaliable",
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async agedebtors2(adminid, companyid) {
    let response: CommonResponseDto;
    try {
      let agedeb = await this.listAgedebtors2_2(adminid, companyid);
      response = {
        status: true,
        message: "Aged Debitors List",
        data: {
          agedDebtors: agedeb,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async listagedebit(adminid, id, sDate) {
    let sdate = sDate;
    let outamount30 = 0;
    let Aoutamount30 = 0;
    let outamount60 = 0;
    let Aoutamount60 = 0;
    let outamount90 = 0;
    let Aoutamount90 = 0;
    let outamount120 = 0;
    let Aoutamount120 = 0;
    let outamountOLD = 0;
    let AoutamountOLD = 0;
    let outstandingval = 0;
    let Aoutstandingval = 0;
    let outstanding = 0;
    let Aoutstanding = 0;
    let total30 = 0;
    let total60 = 0;
    let total90 = 0;
    let total120 = 0;
    let totalOLD = 0;
    let finalOuts = 0;

    try {
      const debinvoice = await this.sale_invoice.findAllByQuery({
        where: {
          adminid,
          [Op.or]: [
            {
              status: null,
            },
            {
              status: {
                [Op.ne]: "2",
              },
            },
          ],
          sdate: {
            [Op.lt]: sdate,
          },
          customerid: Number(id),
        },
      });

      if (debinvoice) {
        for (var i = 0; i <= debinvoice.length; i++) {
          let element = debinvoice[i];
          if (element) {
            if (element && element.type == "Sales Credit Notes") {
              Aoutstandingval = -Number(element.outstanding);
              Aoutstanding = Number(Aoutstanding) + Number(Aoutstandingval);
            } else {
              Aoutstandingval = Number(element.outstanding);
              Aoutstanding = Number(Aoutstanding) + Number(Aoutstandingval);
            }
            let day = this.creditdays(sdate, element.sdate);

            if (day == "30") {
              Aoutamount30 += Number(Aoutstandingval);
            } else if (day == "60") {
              Aoutamount60 += Number(Aoutstandingval);
            } else if (day == "90") {
              Aoutamount90 += Number(Aoutstandingval);
            } else if (day == "120") {
              Aoutamount120 += Number(Aoutstandingval);
            } else if (day == "older") {
              AoutamountOLD += Number(Aoutstandingval);
            }
          }
        }
      }
      total30 = Number(Aoutamount30) + Number(outamount30);
      total60 = Number(Aoutamount60) + Number(outamount60);
      total90 = Number(Aoutamount90) + Number(outamount90);
      total120 = Number(Aoutamount120) + Number(outamount120);
      totalOLD = Number(AoutamountOLD) + Number(outamountOLD);
      finalOuts = Number(outstanding) + Number(Aoutstanding);

      let debage = {
        total30: total30,
        total60: total60,
        total90: total90,
        total120: total120,
        totalOLD: totalOLD,
        outstanding: finalOuts,
      };
      return debage;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllAgedebtorsList(adminid, companyid, id) {
    try {
      const debinvoice = await this.sale_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          companyid,
          type: "sales",
          customerid: id,
        },
        order: [["id", "DESC"]],
      });
      const results = await this.sale_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          companyid,
          type: "scredit",
          customerid: id,
        },
        order: [["id", "DESC"]],
      });
      const debitNote = await this.purchase_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          companyid,
          type: "pcredit",
          supplierid: id,
        },
        order: [["id", "DESC"]],
      });
      const purchace = await this.purchase_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          companyid,
          type: "purchase",
          supplierid: id,
        },
        order: [["id", "DESC"]],
      });

      const purchaceAsset = await this.purchase_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          companyid,
          type: "stockassets",
          supplierid: id,
        },
        order: [["id", "DESC"]],
      });
      const cashAndBack = await this.ledger_details.findAllByQuery({
        where: {
          adminid: adminid,
          companyid,
          is_deleted: false,
          cname: id,
          discount_status: {
            [Op.or]: [{ [Op.ne]: 1 }, { [Op.is]: null }],
          },
          booleantype: [
            "14",
            "22",
            "8",
            "6",
            "4",
            "5",
            "3",
            "42",
            "7",
            "13",
            "23",
            "16",
            "15",
            "97",
            "19",
          ],
        },
      });
      const allDatas = [
        ...debinvoice,
        ...purchace,
        ...purchaceAsset,
        ...debitNote,
        ...cashAndBack,
        ...results,
      ];
      return allDatas;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async listAgedebtors2_2(adminid, companyid) {
    try {
      const getCustomers = await this.contactMasterService.findAllByQuery({
        where: {
          adminid: adminid,
          companyid,
          contractors_type: "customer",
        },
        order: [["id", "asc"]],
        raw: true,
      });

      let allFilteredData = [];

      for (let i = 0; i < getCustomers.length; i++) {
        const idByData = await this.findAllAgedebtorsList(
          adminid,
          companyid,
          getCustomers[i].id
        );
        idByData["customer"] = getCustomers[i];
        idByData["customerId"] = getCustomers[i].id;
        allFilteredData.push(idByData);
      }

      let currentMonth = new Date().getMonth() + 1;

      let filteredData = allFilteredData.map((item) => {
        let totaldebit = item.reduce((total, entry) => {
          if (entry.type) {
            if (entry.type === "sales" || entry.type === "pcredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Customer Refund" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.credit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);

        let totalCredit = item.reduce((total, entry) => {
          if (entry.type) {
            if (entry.type === "purchase" || entry.type === "scredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Customer Reciept" ||
              entry.type === "Other Receipt" ||
              entry.type === "Supplier Refund"
            ) {
              return total + Number(entry?.debit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        let currentMonthdebit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === currentMonth) {
            if (entry.type === "sales" || entry.type === "pcredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Customer Refund" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.credit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);

        let currentMonthCredit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === currentMonth) {
            if (entry.type === "purchase" || entry.type === "scredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Customer Reciept" ||
              entry.type === "Other Receipt" ||
              entry.type === "Supplier Refund"
            ) {
              return total + Number(entry?.debit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        let prevMonthDebit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (
            entryMonth === (currentMonth - 1 + 12) % 12 ||
            (currentMonth === 1 && entryMonth === 12)
          ) {
            if (entry.type === "sales" || entry.type === "pcredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Customer Refund" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.credit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);
        let prevMonthCredit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (
            entryMonth === (currentMonth - 1 + 12) % 12 ||
            (currentMonth === 1 && entryMonth === 12)
          ) {
            if (entry.type === "purchase" || entry.type === "scredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Customer Reciept" ||
              entry.type === "Other Receipt" ||
              entry.type === "Supplier Refund"
            ) {
              return total + Number(entry?.debit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        let lastThreeMonthsDebit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === (currentMonth - 2 + 12) % 12) {
            if (entry.type === "sales" || entry.type === "pcredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Customer Refund" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.credit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);
        let lastThreeMonthsCredit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === (currentMonth - 2 + 12) % 12) {
            if (entry.type === "purchase" || entry.type === "scredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Customer Reciept" ||
              entry.type === "Other Receipt" ||
              entry.type === "Supplier Refund"
            ) {
              return total + Number(entry?.debit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);
        let lastFourMonthsDebit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === (currentMonth - 3 + 12) % 12) {
            if (entry.type === "sales" || entry.type === "pcredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Customer Refund" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.credit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);
        let lastFourMonthsCredit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === (currentMonth - 3 + 12) % 12) {
            if (entry.type === "purchase" || entry.type === "scredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Customer Reciept" ||
              entry.type === "Other Receipt" ||
              entry.type === "Supplier Refund"
            ) {
              return total + Number(entry?.debit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        let customer = item.customer;
        let customerId = item.customerId;
        const totalPrice = Number(totaldebit) - Number(totalCredit);
        const lastFourMonthsTotal =
          Number(lastFourMonthsDebit) - Number(lastFourMonthsCredit);
        const lastThreeMonthsTotal =
          Number(lastThreeMonthsDebit) -
          Number(lastThreeMonthsCredit) +
          Number(lastFourMonthsTotal);
        const lastTwoMonthsTotal =
          Number(prevMonthDebit) -
          Number(prevMonthCredit) +
          Number(lastThreeMonthsTotal);
        const currentMonthTotal =
          Number(currentMonthdebit) -
          Number(currentMonthCredit) +
          Number(lastTwoMonthsTotal);
        return {
          currentMonthTotal: Number(currentMonthTotal).toFixed(2),
          id: customerId,
          customer_name: customer.bus_name,
          totalPrice: Number(totalPrice).toFixed(2),
          lastTwoMonthsTotal: Number(lastTwoMonthsTotal).toFixed(2),
          lastThreeMonthsTotal: Number(lastThreeMonthsTotal).toFixed(2),
          lastFourMonthsTotal: Number(lastFourMonthsTotal).toFixed(2),
          customer: customer,
        };
      });
      return filteredData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async saveviewemail(invoiceData: any) {
    let response: CommonResponseDto;

    try {
      let {
        userid,
        sale,
        insale,
        customer,
        bankInfo,
        selectedBank,
        paymentInfoNeeded,
        invoiceType,
        pagetype,
      } = invoiceData;
      let vattable,
        quotes,
        taxinfo,
        coltax = "";
      let userInfo: any = await this.user.getUser(userid);
      let defaultBankInfo: any = await this.account_master.getUserBankList(
        userid
      );
      if (
        defaultBankInfo != null &&
        defaultBankInfo.status &&
        defaultBankInfo.data.length > 0
      ) {
        defaultBankInfo = {
          name: defaultBankInfo.data[0].laccount,
          accountNumber: defaultBankInfo.data[0].accnum,
          iban: defaultBankInfo.data[0].ibannum,
        };
      }

      userInfo = userInfo.data;
      userInfo.defaultBankInfo = defaultBankInfo;
      let companyInfo = userInfo.companyInfo;
      const countryInfo = await this.countries.getOne(userInfo.countryid);
      userInfo.countryInfo = countryInfo;
      let title = "Invoice";
      let title1 = "Invoice";
      if (sale.type === "sales") {
        title = "Invoice";
        title1 = "Invoice";
      } else {
        title = "Credit Notes";
        title1 = "Credit";
      }
      let invoiceview = "";
      let vatTotal: any = 0;
      let vatRate = 0;
      let discountTotal = 0;
      let netTotal: any = 0;
      let uniqueVat = [];
      const userdate = new Date();
      for (var i = 0; i < insale.length; i++) {
        if (userInfo.companyInfo.tax != "none") {
          coltax = await this.ColTax(insale[i], "1");
        }
        var invoiceview2 = await this.InvoiceView(
          insale[i],
          "1",
          coltax,
          userInfo
        );
        invoiceview += invoiceview2;
        vatTotal +=
          (Number(insale[i].incomeTax) *
            (Number(insale[i].quantity) * Number(insale[i].costprice) -
              Number(insale[i].discount || 0))) /
          100;
        vatRate += Number(insale[i].incomeTax);
        // }
        netTotal += Number(
          Number(insale[i].quantity) * Number(insale[i].costprice)
        );
        discountTotal += Number(insale[i].discount || 0);
        uniqueVat.push(insale[i].incomeTax);
      }
      uniqueVat = [...new Set(uniqueVat)];
      netTotal = Number(netTotal) - Number(discountTotal);
      vatTotal = Number(vatTotal).toFixed(2);
      netTotal = Number(netTotal).toFixed(2);

      for (var i = 0; i < uniqueVat.length; i++) {
        const element = uniqueVat[i];
        let costPrice: any = 0;
        let itAmt: any = 0;
        let total_: any = 0;

        for (var j = 0; j < insale.length; j++) {
          if (element == insale[j].incomeTax) {
            costPrice += Number(
              Number(insale[j].quantity) * Number(insale[j].costprice)
            );
            itAmt += Number(insale[j].incomeTaxAmount);
            total_ += Number(insale[j].total);
          }
        }
        costPrice = Number(costPrice).toFixed(2);
        itAmt = Number(itAmt).toFixed(2);
        total_ = Number(total_).toFixed(2);
        vattable += await this.Vattable("1", element, costPrice, itAmt, total_);
      }

      let paymentHtml = "";
      let htmlPay = "";
      let bankPay = "";
      if (!bankInfo) {
        bankInfo = await this.ledger_details.findAllByQuery({
          where: {
            userid,
            saleid: sale.id,
            type: "Customer Payment",
          },
        });
      }
      for (let b = 0; b < bankInfo.length; b++) {
        const ele = bankInfo[b];
        bankPay += `<tr>
        <td style="width:15%;padding: 5px 0;text-align:center">${
          bankInfo[b].bankInf.laccount || "-"
        }</td>
        <td style="width:15%;padding: 5px 0;text-align:center">${
          bankInfo[b].bankInf.accnum || "-"
        }</td>
        <td style="width:15%;padding: 5px 0;text-align:center">${moment(
          bankInfo[b].date
        ).format("DD-MM-YYYY")}</td>
        <td style="width:20%;padding: 5px 0;text-align:center">${
          bankInfo[b].paidmethod || "-"
        }</td>
        <td style="width:20%;padding: 5px 0;text-align:center">${
          bankInfo[b].bankInf.acctype || "-"
        }</td>
        <td style="width:15%;padding: 5px 0; text-align:center">${
          countryInfo.symbol
        } ${bankInfo[b].amount} </td></tr>`;
      }
      if (bankInfo.length > 0) {
        htmlPay = `<table style="width:100%"><thead style="background-color:black;color:white;border-left:10px solid #ffbc49; font-size:10px;text-align: center">
        <tr style='border: 1px solid #e1e1e1;'>
        <th style="width:15%;padding: 5px 0">BANK</th>
        <th style="width:15%;padding: 5px 0">ACCOUNT NO.</th>
        <th style="width:20%;padding: 5px 0">DATE</th>
        <th style="width:20%;padding: 5px 0">PAID METHOD</th>
        <th style="width:15%;padding: 5px 0">PAYMENT TYPE</th>
        <th style="width:15%;padding: 5px 0">AMOUNT</th>
    </tr>
    </thead>
    <tbody style="font-size:10px;">${bankPay}</tbody></table>`;
      }

      if (sale.status != "0") {
        // Bank Table Design
      }

      let imgLogo = `<p style='margin: 10px 0px;font-size: 13px;color: black;font-weight: 600'> 
          ${title}
          "</p><h2><strong>#
          ${sale.invoiceno} </strong></h2><br />${
        sale.status == "2"
          ? '<div><span style="padding: 5px; border: 1px solid green;color:green;font-weight:700">Paid</span></div>'
          : ""
      }`;
      if (companyInfo.logo) {
        imgLogo = `<a target="_blank" href="${
          companyInfo.webstite || "www.taxgoglobal.com"
        }"><img style="border-radius:50%;width:180px;align:center;padding:3px" src="https://taxgo.s3.eu-west-1.amazonaws.com/logo/${
          userInfo.logo
        }" /><a/>`;
      } else {
        imgLogo = `<a target="_blank" href="${
          companyInfo.webstite || "www.taxgoglobal.com"
        }"><img style="border-radius:50%;width:180px;align:center;padding:3px" src="https://taxgo.s3.eu-west-1.amazonaws.com/company/logo/logotrans.png" /></a>`;
      }
      sale.sdate = moment(sale.sdate).format("DD:MM:YYYY");
      sale.ldate = moment(sale.ldate).format("DD:MM:YYYY");
      sale.quotesArray = sale.quotes.split("\n");
      sale.termsArray = sale.terms.split("\n");
      let cart_body = await this.createInvoiceTemplate({
        sale,
        insale,
        title,
        userInfo,
        customer,
        countryInfo,
        imgLogo,
        htmlPay,
        vatRate,
        vatTotal,
        netTotal,
        bankInfo,
        type: "1",
        vattable,
        paymentInfoNeeded,
        invoiceType,
        selectedBank,
        pagetype,
      });

      const time = new Date().getTime();
      const currentDateStr = moment(time).format("DD-MM-YYYY");
      var filename = `${
        userInfo.companyInfo.bname
          ? userInfo.companyInfo.bname.substring(0, 10)
          : userInfo.firstname
          ? userInfo.firstname.substring(0, 10)
          : ""
      }_${customer.name.substring(0, 5) || customer.name.substring(0, 5)}_${
        sale.invoiceno
      }_${currentDateStr}.pdf`;
      if (userInfo.id == 2214) {
        filename = `${
          userInfo.companyInfo.bname
            ? userInfo.companyInfo.bname.substring(0, 10)
            : userInfo.firstname
            ? userInfo.firstname.substring(0, 10)
            : ""
        }_${customer.name.substring(0, 5) || customer.name.substring(0, 5)}_${
          sale.invoiceno
        }_${currentDateStr}.pdf`;
      }
      let options = { format: "A4" };

      let file = { content: cart_body };
      let sendData = {
        attachment: filename,
        template: cart_body,
        firstname: userInfo.firstname,
        lastname: userInfo.lastname,
        email: userInfo.email,
        invoiceno: sale.invoiceno,
        total: sale.total,
        sdate: sale.sdate,
        type: sale.type,
        //download: uploadData.Location,
      };
      if (sendData) {
        response = {
          status: true,
          data: sendData,
          message: "Invoice File Generated",
        };
      } else {
        response = {
          status: false,
          data: null,
          message: "Invoice Generated without PDF",
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async saveViewePurchasEmail(invoiceData: any) {
    let response: CommonResponseDto;
    try {
      let { userid, purchase, inpurchase, supplier, bankInfo } = invoiceData;
      let vattable,
        quotes,
        taxinfo,
        coltax = "";
      let userInfo: any = await this.user.getUser(userid);
      let defaultBankInfo: any = await this.account_master.getUserBankList(
        userid
      );
      if (
        defaultBankInfo != null &&
        defaultBankInfo.status &&
        defaultBankInfo.data.length > 0
      ) {
        defaultBankInfo = {
          name: defaultBankInfo.data[0].laccount,
          accountNumber: defaultBankInfo.data[0].accnum,
          iban: defaultBankInfo.data[0].ibannum,
        };
      }

      userInfo = userInfo.data;
      userInfo.defaultBankInfo = defaultBankInfo;
      let companyInfo = userInfo.companyInfo;
      const countryInfo = await this.countries.getOne(userInfo.countryid);
      userInfo.countryInfo = countryInfo;
      let title = "Invoice";
      let title1 = "Invoice";
      if (purchase.type === "purchase") {
        title = "Invoice";
        title1 = "Invoice";
      } else {
        title = "Dedit Notes";
        title1 = "Dedit";
      }
      let invoiceview = "";
      let vatTotal: any = 0;
      let vatRate = 0;
      let discountTotal = 0;
      let netTotal: any = 0;
      let uniqueVat = [];
      const userdate = new Date();
      for (var i = 0; i < inpurchase.length; i++) {
        if (userInfo.companyInfo.tax != "none") {
          coltax = await this.ColTax(inpurchase[i], "1");
        }
        var invoiceview2 = await this.InvoiceView(
          inpurchase[i],
          "1",
          coltax,
          userInfo
        );
        invoiceview += invoiceview2;
        vatTotal +=
          (Number(inpurchase[i].incomeTax) *
            (Number(inpurchase[i].quantity) * Number(inpurchase[i].costprice) -
              Number(inpurchase[i].discount || 0))) /
          100;
        vatRate += Number(inpurchase[i].incomeTax);
        // }
        netTotal += Number(
          Number(inpurchase[i].quantity) * Number(inpurchase[i].costprice)
        );
        discountTotal += Number(inpurchase[i].discount || 0);
        uniqueVat.push(inpurchase[i].incomeTax);
      }
      uniqueVat = [...new Set(uniqueVat)];
      netTotal = Number(netTotal) - Number(discountTotal);
      vatTotal = Number(vatTotal).toFixed(2);
      netTotal = Number(netTotal).toFixed(2);

      for (var i = 0; i < uniqueVat.length; i++) {
        const element = uniqueVat[i];
        let costPrice: any = 0;
        let itAmt: any = 0;
        let total_: any = 0;

        for (var j = 0; j < inpurchase.length; j++) {
          if (element == inpurchase[j].incomeTax) {
            costPrice += Number(
              Number(inpurchase[j].quantity) * Number(inpurchase[j].costprice)
            );
            itAmt += Number(inpurchase[j].incomeTaxAmount);
            total_ += Number(inpurchase[j].total);
          }
        }
        costPrice = Number(costPrice).toFixed(2);
        itAmt = Number(itAmt).toFixed(2);
        total_ = Number(total_).toFixed(2);
        vattable += await this.Vattable("1", element, costPrice, itAmt, total_);
      }

      let paymentHtml = "";
      let htmlPay = "";
      let bankPay = "";
      if (!bankInfo) {
        bankInfo = await this.ledger_details.findAllByQuery({
          where: {
            userid,
            purchaseid: inpurchase.id,
            type: "Supplier Payment",
          },
        });
      }
      for (let b = 0; b < bankInfo.length; b++) {
        const ele = bankInfo[b];
        bankPay += `<tr>
        <td style="width:15%;padding: 5px 0;text-align:center">${
          bankInfo[b].bankInf.laccount || "-"
        }</td>
        <td style="width:15%;padding: 5px 0;text-align:center">${
          bankInfo[b].bankInf.accnum || "-"
        }</td>
        <td style="width:15%;padding: 5px 0;text-align:center">${moment(
          bankInfo[b].date
        ).format("DD-MM-YYYY")}</td>
        <td style="width:20%;padding: 5px 0;text-align:center">${
          bankInfo[b].paidmethod || "-"
        }</td>
        <td style="width:20%;padding: 5px 0;text-align:center">${
          bankInfo[b].bankInf.acctype || "-"
        }</td>
        <td style="width:15%;padding: 5px 0; text-align:center">${
          countryInfo.symbol
        } ${bankInfo[b].amount} </td></tr>`;
      }
      if (bankInfo.length > 0) {
        htmlPay = `<table style="width:100%"><thead style="background-color:black;color:white;border-left:10px solid #ffbc49; font-size:10px;text-align: center">
        <tr style='border: 1px solid #e1e1e1;'>
        <th style="width:15%;padding: 5px 0">BANK</th>
        <th style="width:15%;padding: 5px 0">ACCOUNT NO.</th>
        <th style="width:20%;padding: 5px 0">DATE</th>
        <th style="width:20%;padding: 5px 0">PAID METHOD</th>
        <th style="width:15%;padding: 5px 0">PAYMENT TYPE</th>
        <th style="width:15%;padding: 5px 0">AMOUNT</th>
    </tr>
    </thead>
    <tbody style="font-size:10px;">${bankPay}</tbody></table>`;
      }

      let imgLogo = `<p style='margin: 10px 0px;font-size: 13px;color: black;font-weight: 600'> 
          ${title}
          "</p><h2><strong>#
          ${purchase.invoiceno} </strong></h2><br />${
        purchase.status == "2"
          ? '<div><span style="padding: 5px; border: 1px solid green;color:green;font-weight:700">Paid</span></div>'
          : ""
      }`;
      if (companyInfo.logo) {
        imgLogo = `<a target="_blank" href="${
          companyInfo.webstite || "www.taxgoglobal.com"
        }"><img style="border-radius:50%;width:180px;align:center;padding:3px" src="https://taxgo.s3.eu-west-1.amazonaws.com/logo/${
          userInfo.logo
        }" /><a/>`;
      } else {
        imgLogo = `<a target="_blank" href="${
          companyInfo.webstite || "www.taxgoglobal.com"
        }"><img style="border-radius:50%;width:180px;align:center;padding:3px" src="https://taxgo.s3.eu-west-1.amazonaws.com/company/logo/logotrans.png" /></a>`;
      }
      purchase.sdate = moment(purchase.sdate).format("DD:MM:YYYY");
      purchase.ldate = moment(purchase.ldate).format("DD:MM:YYYY");
      let cart_body = await this.createPurchaseInvoiceTemplate({
        purchase,
        inpurchase,
        title,
        userInfo,
        supplier,
        countryInfo,
        imgLogo,
        htmlPay,
        vatRate,
        vatTotal,
        netTotal,
        bankInfo,
        type: "1",
        vattable,
      });

      const time = new Date().getTime();
      const currentDateStr = moment(time).format("DD-MM-YYYY");
      var filename = `${
        userInfo.companyInfo.bname
          ? userInfo.companyInfo.bname.substring(0, 10)
          : userInfo.firstname
          ? userInfo.firstname.substring(0, 10)
          : ""
      }_${supplier.name.substring(0, 5) || supplier.name.substring(0, 5)}_${
        purchase.invoiceno
      }_${currentDateStr}.pdf`;
      if (userInfo.id == 2214) {
        filename = `${
          userInfo.companyInfo.bname
            ? userInfo.companyInfo.bname.substring(0, 10)
            : userInfo.firstname
            ? userInfo.firstname.substring(0, 10)
            : ""
        }_${supplier.name.substring(0, 5) || supplier.name.substring(0, 5)}_${
          purchase.invoiceno
        }_${currentDateStr}.pdf`;
      }
      let options = { format: "A4" };

      let file = { content: cart_body };
      let sendData = {
        attachment: filename,
        template: cart_body,
        firstname: userInfo.firstname,
        lastname: userInfo.lastname,
        email: userInfo.email,
        invoiceno: purchase.invoiceno,
        total: purchase.total,
        sdate: purchase.sdate,
        type: purchase.type,
        //download: uploadData.Location,
      };
      if (sendData) {
        response = {
          status: true,
          data: sendData,
          message: "Invoice File Generated",
        };
      } else {
        response = {
          status: false,
          data: null,
          message: "Invoice Generated without PDF",
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async ColTax(sale, style) {
    if (style == "1") {
      return `<td style='width:10%;padding:3px;text-align:center'>${
        sale.incomeTaxAmount
      } @${Number(sale.incomeTax).toFixed(2)}</td>`;
    }
  }

  async InvoiceView(sale, style, coltax, user) {
    if (style == "1") {
      return `<tr style='border: 1px solid #e1e1e1;font-size:11px'><td style='width:25%;padding:2px;text-align:center'>${
        user.id == 1304
          ? sale.product.icode + " - " + sale.product.idescription
          : sale.description
      }</td> <td style='width:15%;padding:3px;text-align:center'>${
        user.id == 1304
          ? sale.description
          : sale.ledgerDetails
          ? sale.ledgerDetails.nominalcode + " - " + sale.ledgerDetails.laccount
          : ""
      }</td><td style='width:15%;padding:2px;text-align:center'>${
        sale.costprice
      }</td> <td style='width:10%;padding:2px;text-align:center'>${
        sale.quantity
      }</td><td style='width:10%;padding:2px;text-align:center'>${
        sale.discount
      } ${
        sale.discount > 0
          ? `@${Number(
              (sale.discount /
                Number(sale.costprice * sale.quantity || sale.rate)) *
                100
            ).toFixed(2)}%`
          : ``
      }</td>${coltax}<td style='width:20%;padding:2px;text-align:center'>${
        sale.total
      }</td></tr>`;
    }
  }

  async Vattable(style, element, costPrice, itAmt, total_) {
    if (style == "1") {
      return `<tr style='border-bottom: 1px solid #e1e1e1'><td style='width:20%;padding:5px;text-align:center'>${element} % </td><td style='width:20%;padding:5px;text-align:center'>${costPrice}</td><td style='width:20%;padding:5px;text-align:center'>${itAmt}</td><td style='width:20%;padding:5px;text-align:center'>${total_}</td></tr>`;
    }
  }

  async createInvoiceTemplate(data) {
    let template = "";
    try {
      const filePath = `../shared/templates/invoice_${data.userInfo.companyInfo.defaultinvoice}.hjs`;
      template = await fs.readFileSync(path.resolve(__dirname, filePath));
    } catch (error) {
      console.error(`Got an error trying to read the file: ${error.message}`);
    }
    data.sale["terms"] =
      data.sale.terms && Buffer.from(data.sale.terms).toString() !== ""
        ? Buffer.from(data.sale.terms).toString()
        : "";

    data.userInfo.companyInfo["taxregno"] =
      data.userInfo.companyInfo.taxregno &&
      Buffer.from(data.userInfo.companyInfo.taxregno).toString() !== ""
        ? Buffer.from(data.userInfo.companyInfo.taxregno).toString()
        : "";

    data.sale.totalText = await this.getAmountToWords(
      data.userInfo.countryid,
      data.sale.total
    );
    data.saleComplete = data.sale.status === 2;
    let output = await Mustache.render(template.toString(), data);
    return output;
  }

  async createPurchaseInvoiceTemplate(data) {
    let template = "";
    try {
      const filePath = `../shared/templates/purchase_invoice_${data.userInfo.companyInfo.defaultinvoice}.hjs`;
      template = await fs.readFileSync(path.resolve(__dirname, filePath));
    } catch (error) {
      console.error(`Got an error trying to read the file: ${error.message}`);
    }
    data.purchase["terms"] =
      data.purchase.terms && Buffer.from(data.purchase.terms).toString() !== ""
        ? Buffer.from(data.purchase.terms).toString()
        : "";
    data.purchase["quotes"] =
      data.purchase.quotes &&
      Buffer.from(data.purchase.quotes).toString() !== ""
        ? Buffer.from(data.purchase.quotes).toString()
        : "";

    data.userInfo.companyInfo["taxregno"] =
      data.userInfo.companyInfo.taxregno &&
      Buffer.from(data.userInfo.companyInfo.taxregno).toString() !== ""
        ? Buffer.from(data.userInfo.companyInfo.taxregno).toString()
        : "";

    data.purchase.totalText = await this.getAmountToWords(
      data.userInfo.countryid,
      data.purchase.total
    );
    data.purchaseComplete = data.purchase.status === 2;
    let output = await Mustache.render(template.toString(), data);
    return output;
  }
  removeSpecialChar(str) {
    if (str) {
      return str.replace(/[~`!@#$%^&*()+={}\[\];:\'\"<>.,\/\\\?-_]/g, "");
    } else {
      ("");
    }
  }

  async getAmountToWords(countryid, amount) {
    let amountText = "";
    let amountSplit =
      amount && amount.toString().indexOf(".") > 0
        ? amount.toString().split(".")
        : amount
        ? [amount]
        : [];
    let country = await this.countries.getOne(countryid);
    if (country && amountSplit && amountSplit.length > 0) {
      let firstPart = await numberToWords.toWords(parseInt(amountSplit[0]));
      let secondPart = "";
      amountText = firstPart + " " + country.maincurrency + "s";
      if (amountSplit[1] && parseInt(amountSplit[1]) > 0) {
        secondPart = await numberToWords.toWords(parseInt(amountSplit[1]));
        amountText = amountText + " and ";
        amountText = amountText + secondPart + " " + country.subcurrency;
      }
    } else {
      amountText = await numberToWords.toWords(amount);
    }
    amountText = amountText + " only";
    return amountText.toString();
  }

  async overallVatReport(userid, fdate, lastdate) {
    let response: CommonResponseDto;
    let sdate = await new Date(new Date(fdate).setHours(0, 0, 0, 0));
    let ldate = await new Date(new Date(lastdate).setHours(23, 59, 59, 59));

    try {
      const userInfo: any = await this.user.getUser(userid);

      if (userInfo.status) {
        const reportType = userInfo.data.companyInfo.reporttype;
        const adminid = userInfo.data.adminid;
        let condition: any = {
          adminid: adminid,
          status: [1, 2],
          paymentdate: {
            [Op.gte]: sdate,
            [Op.lte]: ldate,
          },
        };
        if (reportType != 1) {
          condition = {
            adminid: adminid,
            status: [null, 0, 1, 2],
            sdate: {
              [Op.gte]: sdate,
              [Op.lte]: ldate,
            },
          };
        }
        const allSales = await this.sale_invoice.findAllByQuery({
          where: condition,
        });
        let saleids = [];

        if (allSales) {
          allSales.forEach((element) => {
            saleids.push(Number(element.id));
          });
        }

        const allPurchases = await this.purchase_invoice.findAllByQuery({
          where: condition,
        });
        let purchaseids = [];
        if (allPurchases) {
          allPurchases.forEach((element) => {
            purchaseids.push(Number(element.id));
          });
        }

        const taxRate: any = await this.tax_master.findAll(userid);
        let count = 0;
        let overAllVat = [];

        for (var i = 0; i < taxRate.data.length; i++) {
          let element = taxRate.data[i];
          count++;
          const getAllSales = await this.invoiceItemsService.findAllByQuery({
            where: {
              adminid: adminid,
              incomeTax: Number(element.percentage),
              type: "Sales Invoice",
              saleid: { [Op.in]: saleids },
              // sdate: {
              //   [Op.gte]: sdate,
              //   [Op.lte]: ldate,
              // },
            },
          });
          let vatOnSale = 0;
          if (getAllSales) {
            let credit = 0;
            getAllSales.forEach((element) => {
              credit += Number(element.incomeTaxAmount);
            });
            vatOnSale = credit;
          }
          const getAllPurchase = await this.invoiceItemsService.findAllByQuery({
            where: {
              adminid: adminid,
              vat: Number(element.percentage),
              type: "Purchase Invoice",
              purchaseid: { [Op.in]: purchaseids },
              // sdate: {
              //   [Op.gte]: sdate,
              //   [Op.lte]: ldate,
              // },
            },
          });
          let vatOnPurchase = 0;
          if (getAllPurchase) {
            let credit = 0;
            getAllPurchase.forEach((element) => {
              credit += Number(element.incomeTaxAmount);
            });
            vatOnPurchase = credit;
          }
          const getAllOtherPayment =
            await this.invoiceItemsService.findAllByQuery({
              where: {
                adminid: adminid,
                incomeTax: Number(element.percentage),
                type: "Other Payment",
                sdate: {
                  [Op.gte]: sdate,
                  [Op.lte]: ldate,
                },
              },
            });

          let totalOP = 0;
          if (getAllOtherPayment) {
            getAllOtherPayment.forEach((element) => {
              totalOP += Number(element.incomeTaxAmount);
            });
          }
          const getAllOtherReceipt =
            await this.invoiceItemsService.findAllByQuery({
              where: {
                adminid: adminid,
                incomeTax: Number(element.percentage),
                type: "Other Receipt",
                sdate: {
                  [Op.gte]: sdate,
                  [Op.lte]: ldate,
                },
              },
            });

          let totalOR = 0;
          if (getAllOtherReceipt) {
            getAllOtherReceipt.forEach((element) => {
              totalOR += Number(element.incomeTaxAmount);
            });
          }

          let vatSales = {
            taxtype: element.taxtype,
            percentage: element.percentage,
            total: Number(Number(vatOnSale) + Number(totalOR)).toFixed(2),
            id: 54,
          };
          let vatPurchase = {
            taxtype: element.taxtype,
            percentage: element.percentage,
            total: Number(Number(vatOnPurchase) + Number(totalOP)).toFixed(2),
            id: 55,
          };
          let overAllBypercentage = {
            vatSales,
            vatPurchase,
          };

          overAllVat.push(overAllBypercentage);

          if (count == taxRate.data.length) {
            response = {
              status: true,
              message: "Vat Return List by Percentage",
              data: overAllVat,
            };
          }
        }
      } else {
        response = {
          status: false,
          message: "User Not Found",
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async agedcreditors(adminid, sdate) {
    let response: CommonResponseDto;
    let date = new Date(sdate);
    try {
      const getSuppliers = await this.contactMasterService.findAllByQuery({
        where: {
          adminid: adminid,
          contractors_type: "supplier",
        },
        order: [["id", "asc"]],
      });
      if (getSuppliers) {
        let creval = [];
        let creTotal30 = 0;
        let creTotal60 = 0;
        let creTotal90 = 0;
        let creTotal120 = 0;
        let creTotalOLD = 0;
        let creTotalOut = 0;
        for (var i = 0; i < getSuppliers.length; i++) {
          let element = getSuppliers[i];
          let agecre = await this.listagecredit(adminid, element.id, date);
          let nage = {
            sname: element.name,
            id: element.id,
            age: agecre,
            cData: element,
          };
          creTotal30 += Math.abs(agecre["total30"]);
          creTotal60 += Math.abs(agecre["total60"]);
          creTotal90 += Math.abs(agecre["total90"]);
          creTotal120 += Math.abs(agecre["total120"]);
          creTotalOLD += Math.abs(agecre["totalOLD"]);
          creTotalOut += Math.abs(agecre["outstanding"]);
          creval.push(nage);
        }
        let creTotal = {
          total30: Number(creTotal30).toFixed(2),
          total60: Number(creTotal60).toFixed(2),
          total90: Number(creTotal90).toFixed(2),
          total120: Number(creTotal120).toFixed(2),
          totalOLD: Number(creTotalOLD).toFixed(2),
          outstanding: Number(creTotalOut).toFixed(2),
        };
        response = {
          status: true,
          message: "Aged Creditor Data",
          data: {
            creval,
            totalVal: creTotal,
          },
        };
      } else {
        response = {
          status: false,
          message: "No Creditors Details Avaliable",
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async agedcreditors2(adminid: number, companyid: number) {
    let response: CommonResponseDto;
    try {
      let agedeb = await this.listagecredit2_2(adminid, companyid);
      response = {
        status: true,
        message: "Aged Creditors List",
        data: {
          agedDebtors: agedeb,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async listagecredit(adminid, id, sDate) {
    let sdate = sDate;
    let outamount30 = 0;
    let Aoutamount30 = 0;
    let outamount60 = 0;
    let Aoutamount60 = 0;
    let outamount90 = 0;
    let Aoutamount90 = 0;
    let outamount120 = 0;
    let Aoutamount120 = 0;
    let outamountOLD = 0;
    let AoutamountOLD = 0;
    let outstandingval = 0;
    let Aoutstandingval = 0;
    let outstanding = 0;
    let Aoutstanding = 0;
    let total30 = 0;
    let total60 = 0;
    let total90 = 0;
    let total120 = 0;
    let totalOLD = 0;
    let finalOuts = 0;
    try {
      const debinvoice = await this.purchase_invoice.findAllByQuery({
        where: {
          adminid,
          [Op.or]: [
            {
              status: null,
            },
            {
              status: {
                [Op.ne]: "2",
              },
            },
          ],
          sdate: {
            [Op.lte]: sdate,
          },
          supplierid: Number(id),
        },
      });
      if (debinvoice.length > 0) {
        for (var i = 0; i < debinvoice.length; i++) {
          let element = debinvoice[i];
          if (element) {
            if (element.type == "Purchase Credit Notes") {
              Aoutstandingval = -Number(element.outstanding);
              Aoutstanding = Number(Aoutstanding) + Number(Aoutstandingval);
            } else {
              Aoutstandingval = Number(element.outstanding);
              Aoutstanding = Number(Aoutstanding) + Number(Aoutstandingval);
            }
            let day = await this.creditdays(sdate, element.sdate);

            if (day == "30") {
              Aoutamount30 += Number(Aoutstandingval);
            } else if (day == "60") {
              Aoutamount60 += Number(Aoutstandingval);
            } else if (day == "90") {
              Aoutamount90 += Number(Aoutstandingval);
            } else if (day == "120") {
              Aoutamount120 += Number(Aoutstandingval);
            } else if (day == "older") {
              AoutamountOLD += Number(Aoutstandingval);
            }
          }
        }
      }
      total30 = Number(Aoutamount30) + Number(outamount30);
      total60 = Number(Aoutamount60) + Number(outamount60);
      total90 = Number(Aoutamount90) + Number(outamount90);
      total120 = Number(Aoutamount120) + Number(outamount120);
      totalOLD = Number(AoutamountOLD) + Number(outamountOLD);
      finalOuts = Number(outstanding) + Number(Aoutstanding);

      let creage = {
        total30: Math.abs(total30),
        total60: Math.abs(total60),
        total90: Math.abs(total90),
        total120: Math.abs(total120),
        totalOLD: Math.abs(totalOLD),
        outstanding: Math.abs(finalOuts),
      };
      return creage;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async listagecredit2_2(adminid, companyid) {
    try {
      const getCustomers = await this.contactMasterService.findAllByQuery({
        where: {
          adminid: adminid,
          companyid,
          contractors_type: "supplier",
        },
        order: [["id", "asc"]],
        raw: true,
      });

      let allFilteredData = [];

      for (let i = 0; i < getCustomers.length; i++) {
        const idByData = await this.findAllAgedebtorsList(
          adminid,
          companyid,
          getCustomers[i].id
        );
        idByData["customer"] = getCustomers[i];
        idByData["customerId"] = getCustomers[i].id;
        allFilteredData.push(idByData);
      }

      let currentMonth = new Date().getMonth() + 1;

      let filteredData = allFilteredData.map((item) => {
        let totaldebit = item.reduce((total, entry) => {
          if (entry.type) {
            if (entry.type === "sales" || entry.type === "pcredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Customer Refund" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.credit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);

        let totalCredit = item.reduce((total, entry) => {
          if (entry.type) {
            if (
              entry.type === "purchase" ||
              entry.type === "scredit" ||
              entry.type == "stockassets"
            ) {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Customer Reciept" ||
              entry.type === "Other Receipt" ||
              entry.type === "Supplier Refund"
            ) {
              return total + Number(entry?.debit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        // current month

        let currentMonthdebit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === currentMonth) {
            if (entry.type === "sales" || entry.type === "pcredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Customer Refund" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.credit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);

        let currentMonthCredit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === currentMonth) {
            if (
              entry.type === "purchase" ||
              entry.type === "scredit" ||
              entry.type === "stockassets"
            ) {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Customer Reciept" ||
              entry.type === "Other Receipt" ||
              entry.type === "Supplier Refund"
            ) {
              return total + Number(entry?.debit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        // previous month

        let prevMonthDebit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (
            entryMonth === (currentMonth - 1 + 12) % 12 ||
            (currentMonth === 1 && entryMonth === 12)
          ) {
            if (entry.type === "sales" || entry.type === "pcredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Customer Refund" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.credit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);
        let prevMonthCredit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (
            entryMonth === (currentMonth - 1 + 12) % 12 ||
            (currentMonth === 1 && entryMonth === 12)
          ) {
            if (
              entry.type === "purchase" ||
              entry.type === "scredit" ||
              entry.type === "stockassets"
            ) {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Customer Reciept" ||
              entry.type === "Other Receipt" ||
              entry.type === "Supplier Refund"
            ) {
              return total + Number(entry?.debit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        // last three months

        let lastThreeMonthsDebit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === (currentMonth - 2 + 12) % 12) {
            if (entry.type === "sales" || entry.type === "pcredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Customer Refund" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.credit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);
        let lastThreeMonthsCredit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === (currentMonth - 2 + 12) % 12) {
            if (
              entry.type === "purchase" ||
              entry.type === "scredit" ||
              entry.type === "stockassets"
            ) {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Customer Reciept" ||
              entry.type === "Other Receipt" ||
              entry.type === "Supplier Refund"
            ) {
              return total + Number(entry?.debit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        // last four months
        let lastFourMonthsDebit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === (currentMonth - 3 + 12) % 12) {
            if (entry.type === "sales" || entry.type === "pcredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Customer Refund" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.credit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);
        let lastFourMonthsCredit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === (currentMonth - 3 + 12) % 12) {
            if (
              entry.type === "purchase" ||
              entry.type === "scredit" ||
              entry.type === "stockassets"
            ) {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Customer Reciept" ||
              entry.type === "Other Receipt" ||
              entry.type === "Supplier Refund"
            ) {
              return total + Number(entry?.debit);
            } else if (entry.type === "Journal") {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        let customer = item.customer;
        let customerId = item.customerId;
        const lastFourMonthsTotal =
          Number(lastFourMonthsCredit) - Number(lastFourMonthsDebit);
        const lastThreeMonthsTotal =
          Number(lastThreeMonthsCredit) -
          Number(lastThreeMonthsDebit) +
          Number(lastFourMonthsTotal);
        const lastTwoMonthsTotal =
          Number(prevMonthCredit) -
          Number(prevMonthDebit) +
          Number(lastThreeMonthsTotal);
        const totalPrice = Number(totalCredit) - Number(totaldebit);
        const currentMonthTotal =
          Number(currentMonthCredit) -
          Number(currentMonthdebit) +
          Number(lastTwoMonthsTotal);
        return {
          currentMonthTotal: Number(currentMonthTotal).toFixed(2),
          id: customerId,
          customer_name: customer.bus_name,
          totalPrice: Number(totalPrice).toFixed(2),
          lastTwoMonthsTotal: Number(lastTwoMonthsTotal).toFixed(2),
          lastThreeMonthsTotal: Number(lastThreeMonthsTotal).toFixed(2),
          lastFourMonthsTotal: Number(lastFourMonthsTotal).toFixed(2),
          customer: customer,
        };
      });
      return filteredData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  creditdays(sdate, edate) {
    let date1 = new Date(edate);
    let date2 = new Date();
    var Difference_In_Time = date2.getTime() - date1.getTime();
    // To calculate the no. of days between two dates
    var diff = Difference_In_Time / (1000 * 3600 * 24);
    let day: any = "30";
    if (diff > -1 && diff < 31) {
      day = "30";
    } else if (diff > 30 && diff < 61) {
      day = "60";
    } else if (diff > 60 && diff < 91) {
      day = "90";
    } else if (diff > 90 && diff < 121) {
      day = "120";
    } else if (diff > 120) {
      day = "older";
    } else {
      day = false;
    }
    return day;
  }

  async nominalagedebtors(adminid, sdate, ldate, id) {
    let response: CommonResponseDto;
    try {
      const agedeb = await this.nominallistdebtors(adminid, id, sdate, ldate);
      const customer = await this.contactMasterService.getOne(id);
      if (agedeb) {
        response = {
          status: true,
          message: "Aged Debitors Nominal List",
          data: {
            agedeb,
            customer,
          },
        };
      } else {
        response = {
          status: false,
          message: "No Debtors Nominal Details Avaliable",
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async nominalagecreditors(adminid, sdate, ldate, id) {
    let response: CommonResponseDto;
    try {
      let agedeb = await this.nominallistcreditors(adminid, id, sdate, ldate);
      const supplier = await this.contactMasterService.getOne(id);
      if (agedeb) {
        response = {
          status: true,
          message: "Aged Creditors Nominal List",
          data: {
            agedeb,
            supplier,
          },
        };
      } else {
        response = {
          status: false,
          message: "No Creditors Nominal Details Avaliable",
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }
  async nominallistcreditors(adminid, id, sDate, lDate) {
    let outamount30 = 0;
    let outamount60 = 0;
    let outamount90 = 0;
    let outamount120 = 0;
    let outamountOLD = 0;
    let outamount3 = 0;
    let outamount6 = 0;
    let outamount9 = 0;
    let outamount12 = 0;
    let outamountold = 0;
    let outstandingval = 0;
    let outstandingval1 = 0;
    let Aoutamount30 = 0;
    let Aoutamount60 = 0;
    let Aoutamount90 = 0;
    let Aoutamount120 = 0;
    let AoutamountOLD = 0;
    let Aoutamount3 = 0;
    let Aoutamount6 = 0;
    let Aoutamount9 = 0;
    let Aoutamount12 = 0;
    let Aoutamountold = 0;
    let Aoutstandingval = 0;
    let Aoutstandingval1 = 0;
    let total30 = 0;
    let total60 = 0;
    let total90 = 0;
    let total120 = 0;
    let totalOLD = 0;
    let sdate = sDate;
    let ldate = lDate;
    let $total30 = 0;
    let outstanding = 0;

    try {
      let debInvoice = await this.purchase_invoice.findAllByQuery({
        where: {
          adminid,
          [Op.or]: [
            {
              status: null,
            },
            {
              status: {
                [Op.ne]: "2",
              },
            },
          ],
          sdate: {
            [Op.gte]: sdate,
            [Op.lte]: ldate,
          },
          supplierid: Number(id),
        },
        order: [["id", "DESC"]],
      });

      let news: any = [];
      let cAgeCeb = [];

      if (debInvoice) {
        for (var i = 0; i < debInvoice.length; i++) {
          let element = debInvoice[i];
          let types = "Purchase Credit Notes";
          if (element.type == "pcredit") {
            Aoutstandingval1 = -Number(element.outstanding);
            Aoutstandingval =
              Number(Aoutstandingval) + Number(Aoutstandingval1);
            types = "Purchase Credit Notes";
          } else {
            Aoutstandingval1 = Number(element.outstanding);
            Aoutstandingval =
              Number(Aoutstandingval) + Number(Aoutstandingval1);
            types = "Purchase Invoice";
          }
          let day = await this.creditdays(sdate, element.sdate);
          if (day == "30") {
            Aoutamount3 = outstandingval1;
            Aoutamount30 += outstandingval1;
          } else if (day == "60") {
            Aoutamount6 = outstandingval1;
            Aoutamount60 += outstandingval1;
          } else if (day == "90") {
            Aoutamount9 = outstandingval1;
            Aoutamount90 += outstandingval1;
          } else if (day == "120") {
            Aoutamount12 = outstandingval1;
            Aoutamount120 += outstandingval1;
          } else if (day == "older") {
            Aoutamountold = outstandingval1;
            AoutamountOLD += outstandingval1;
          }

          let value = {
            sdate: element.sdate,
            type: types,
            invoiceno: element.invoiceno,
            ldate: element.ldate,
            outstanding: element.outstanding,
            total: element.total,
            outtotal: Aoutstandingval1,
            day: day,
            outamount3: Aoutamount3,
            outamount6: Aoutamount6,
            outamount9: Aoutamount9,
            outamount12: Aoutamount12,
            outamountold: Aoutamountold,
          };
          cAgeCeb.push(value);
        }
        news = {
          cAgeCeb,
        };

        $total30 = Number(Aoutamount30) + Number(outamount30);
        total60 = Number(Aoutamount60) + Number(outamount60);
        total90 = Number(Aoutamount90) + Number(outamount90);
        total120 = Number(Aoutamount120) + Number(outamount120);
        totalOLD = Number(AoutamountOLD) + Number(outamountOLD);
        outstanding = Number(Aoutstandingval) + Number(outstandingval);
        let data = {
          total30: total30,
          total60: total60,
          total90: total90,
          total120: total120,
          totalOLD: totalOLD,
          totalout: outstanding,
          news,
        };
        return data;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async nominallistdebtors(adminid, id, sDate, lDate) {
    let outamount30 = 0;
    let outamount60 = 0;
    let outamount90 = 0;
    let outamount120 = 0;
    let outamountOLD = 0;
    let outamount3 = 0;
    let outamount6 = 0;
    let outamount9 = 0;
    let outamount12 = 0;
    let outamountold = 0;
    let outstandingval = 0;
    let outstandingval1 = 0;
    let Aoutamount30 = 0;
    let Aoutamount60 = 0;
    let Aoutamount90 = 0;
    let Aoutamount120 = 0;
    let AoutamountOLD = 0;
    let Aoutamount3 = 0;
    let Aoutamount6 = 0;
    let Aoutamount9 = 0;
    let Aoutamount12 = 0;
    let Aoutamountold = 0;
    let Aoutstandingval = 0;
    let Aoutstandingval1 = 0;
    let total30 = 0;
    let total60 = 0;
    let total90 = 0;
    let total120 = 0;
    let totalOLD = 0;
    let sdate = sDate;
    let ldate = lDate;

    try {
      let debInvoice = await this.sale_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          [Op.or]: [
            {
              status: null,
            },
            {
              status: {
                [Op.ne]: "2",
              },
            },
          ],
          sdate: {
            [Op.lte]: ldate,
            [Op.gte]: sdate,
          },
          customerid: Number(id),
        },
        order: [["id", "DESC"]],
      });

      let news;
      let cAgeCeb = [];

      if (debInvoice) {
        for (var i = 0; i < debInvoice.length; i++) {
          let element = debInvoice[i];
          let types = "Sales Invoice";
          if (element.type == "scredit") {
            Aoutstandingval1 = -Number(element.outstanding);
            Aoutstandingval =
              Number(Aoutstandingval) + Number(Aoutstandingval1);
            types = "Sales Credit Notes";
          } else {
            Aoutstandingval1 = Number(element.outstanding);
            Aoutstandingval =
              Number(Aoutstandingval) + Number(Aoutstandingval1);
            types = "Sales Invoice";
          }
          let day = this.creditdays(sdate, element.sdate);
          if (day == "30") {
            Aoutamount3 = outstandingval1;
            Aoutamount30 += outstandingval1;
          } else if (day == "60") {
            Aoutamount6 = outstandingval1;
            Aoutamount60 += outstandingval1;
          } else if (day == "90") {
            Aoutamount9 = outstandingval1;
            Aoutamount90 += outstandingval1;
          } else if (day == "120") {
            Aoutamount12 = outstandingval1;
            Aoutamount120 += outstandingval1;
          } else if (day == "older") {
            Aoutamountold = outstandingval1;
            AoutamountOLD += outstandingval1;
          }

          let value = {
            sdate: element.sdate,
            type: types,
            invoiceno: element.invoiceno,
            ldate: element.ldate,
            outstanding: element.outstanding,
            total: element.total,
            outtotal: Aoutstandingval1,
            day: day,
            outamount3: Aoutamount3,
            outamount6: Aoutamount6,
            outamount9: Aoutamount9,
            outamount12: Aoutamount12,
            outamountold: Aoutamountold,
          };
          cAgeCeb.push(value);
        }
        news = {
          cAgeCeb,
        };

        total30 = Number(Aoutamount30) + Number(outamount30);
        total60 = Number(Aoutamount60) + Number(outamount60);
        total90 = Number(Aoutamount90) + Number(outamount90);
        total120 = Number(Aoutamount120) + Number(outamount120);
        totalOLD = Number(AoutamountOLD) + Number(outamountOLD);
        outstandingval1 = Number(Aoutstandingval) + Number(outstandingval);
        let data = {
          total30: total30,
          total60: total60,
          total90: total90,
          total120: total120,
          totalOLD: totalOLD,
          totalout: outstandingval1,
          news,
        };
        return data;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getVatNominalList(id, adminid, fdate, ladate) {
    let response: CommonResponseDto;

    try {
      let sdate = new Date(new Date(fdate).setHours(0, 0, 0, 0));
      let ldate = new Date(new Date(ladate).setHours(23, 59, 59, 59));
      let saleType = "Sales Invoice";
      if (id == 54) {
        saleType = "Sales Invoice";
      } else {
        saleType = "Purchase Invoice";
      }
      const userInfo: any = await this.user.getUser(adminid);

      if (!userInfo.status) {
        throw new HttpException({ message: "user not found" }, HttpStatus.OK);
      }
      const reportType = userInfo.data.companyInfo.reporttype;
      const whereClause: any = {
        type: saleType,
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
        adminid: Number(adminid),
        incomeTax: {
          [Op.gt]: 0,
        },
      };
      if (reportType !== 1) {
        whereClause.sdate = {
          [Op.gte]: sdate,
          [Op.lte]: ldate,
        };
      } else {
        whereClause.paymentdate = {
          [Op.gte]: sdate,
          [Op.lte]: ldate,
        };
      }

      const productList = await this.productMasterService.findAllByQuery({
        where: {
          adminid: adminid,
        },
        order: [["id", "DESC"]],
      });
      let productVatList = [];
      if (productList) {
        let count = 0;
        for (var i = 0; i < productList.length; i++) {
          count++;
          let element = productList[i];
          whereClause.idescription = Number(element.id);
          const ledgerList = await this.invoiceItemsService.findAllByQuery({
            where: whereClause,
          });

          let total = 0;
          if (ledgerList) {
            let credit = 0;
            let debit = 0;
            ledgerList.forEach((element) => {
              credit += Number(element.incomeTaxAmount);
            });
            total = Number(credit);
            delete whereClause.idescription;
          }
          let vatproductlist = {
            product: element.idescription,
            id: element.id,
            amount: Number(total).toFixed(2),
          };
          if (total) {
            productVatList.push(vatproductlist);
          }
        }
        if (id === 54) {
          whereClause.type = "Other Payment";
          const otherPayment = await this.invoiceItemsService.findAllByQuery({
            where: whereClause,
          });
          let total = 0;
          if (otherPayment) {
            otherPayment.forEach((element) => {
              total += Number(element.incomeTaxAmount);
            });
          }

          let vatproductlist = {
            product: "Other Payment",
            id: "Other Payment",
            amount: Number(total).toFixed(2),
          };
          if (total) {
            productVatList.push(vatproductlist);
          }
        }
        if (id === 55) {
          whereClause.type = "Other Receipt";
          const otherReceipt = await this.invoiceItemsService.findAllByQuery({
            where: whereClause,
          });
          let total = 0;
          if (otherReceipt) {
            otherReceipt.forEach((element) => {
              total += Number(element.incomeTaxAmount);
            });
          }
          let vatproductlist = {
            product: "Other Receipt",
            id: "Other Receipt",
            amount: Number(total).toFixed(2),
          };
          productVatList.push(vatproductlist);
          if (total) {
            productVatList.push(vatproductlist);
          }
        }
        let overAllTotal = 0;
        productVatList.forEach((element) => {
          overAllTotal += Number(Math.abs(element.amount));
        });
        response = {
          status: true,
          message: "Nominal List By Category",
          data: {
            productVatList,
            totalVat: Number(overAllTotal).toFixed(2),
          },
        };
      } else {
        response = {
          status: false,
          message: "No data Found",
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  async getNominalVat(adminid, id, ledger, fdate, ladate) {
    let response: CommonResponseDto;
    try {
      let sdate = new Date(new Date(fdate).setHours(0, 0, 0, 0));
      let ldate = new Date(new Date(ladate).setHours(23, 59, 59, 59));
      let saleType = "Sales Invoice";
      if (ledger == 54) {
        saleType = "Sales Invoice";
      } else {
        saleType = "Purchase Invoice";
      }

      const userInfo: any = await this.user.getUser(adminid);

      if (!userInfo.status) {
        throw new HttpException({ message: "user not found" }, HttpStatus.OK);
      }
      const reportType = userInfo.data.companyInfo.reporttype;
      let whereClause: any = {
        adminid: Number(adminid),
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
        type: saleType,
        idescription: Number(id),
        incomeTax: {
          [Op.gt]: 0,
        },
      };
      if (reportType !== 1) {
        whereClause.sdate = {
          [Op.gte]: sdate,
          [Op.lte]: ldate,
        };
      } else {
        whereClause.paymentdate = {
          [Op.gte]: sdate,
          [Op.lte]: ldate,
        };
      }

      const nomList = await this.invoiceItemsService.findAllByQuery({
        where: whereClause,
      });

      let nVatReturn = [];
      if (nomList) {
        let count = 0;
        let runningtotal = 0;
        for (var i = 0; i < nomList.length; i++) {
          let element = nomList[i];
          count++;
          const productInfo: any = await this.productMasterService.findById(
            Number(element.idescription)
          );

          const customerDetails: any = await this.contactMasterService.getOne(
            Number(element.cname)
          );

          const supplierDetails: any = await this.contactMasterService.getOne(
            Number(element.cname)
          );

          let productName = "";
          let cName = "";

          if (productInfo) {
            productName = productInfo.idescription;
          }
          let credit = 0;
          let debit = 0;
          let total = 0;
          if (element.booleantype == 1) {
            cName = customerDetails.name;
            credit = element.incomeTaxAmount;
            debit = 0;
            total = Number(credit) - Number(debit);
            runningtotal += Number(total);
          } else if (element.booleantype == 2) {
            cName = supplierDetails.name;
            debit = element.incomeTaxAmount;
            credit = 0;
            total = Number(credit) - Number(debit);
            runningtotal += Number(total);
          } else if (element.booleantype == 24) {
            cName = customerDetails.name;
            debit = element.incomeTaxAmount;
            credit = 0;
            total = Number(credit) - Number(debit);
            runningtotal += Number(total);
          } else if (element.booleantype == 25) {
            cName = supplierDetails.name;
            credit = element.incomeTaxAmount;
            debit = 0;
            total = Number(credit) - Number(debit);
            runningtotal += Number(total);
          } else {
            runningtotal += 0;
          }
          let nList = {
            productname: productName,
            name: cName,
            id: element.id,
            date: element.sdate,
            credit,
            debit,
            incometax: element.incomeTax,
            incometaxamount: element.incomeTaxAmount,
            total: element.total,
            runningtotal: Number(runningtotal).toFixed(2),
          };
          nVatReturn.push(nList);
        }
        response = {
          status: true,
          message: "Nominal Vat Return For Product",
          data: nVatReturn,
        };
      } else {
        response = {
          status: false,
          message: "No Nominal Vat Found",
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
    return response;
  }

  // 13,5
  async profitLossCalc(adminid, startdate, enddate, companyid) {
    let reponse: CommonResponseDto;
    const sdate = moment(startdate).startOf("day").toISOString();
    const edate = moment(enddate).endOf("day").toISOString();

    let indirectIncomeData = [];
    let directExpenseData = [];
    let indirectExpenseData = [];
    let total2 = 0;
    let total3 = 0;
    let total4 = 0;
    let totalDI = 0;
    let DIncome = [];

    try {
      // All incomes
      const allIncomes = await this.account_master.findAllByQuery({
        attributes: ["id", "laccount", "nominalcode", "category", "opening"],
        where: {
          userid: {
            [Op.or]: ["-2", adminid],
          },
          categorygroup: 5,
        },
        order: [["id", "DESC"]],
      });

      // indirect income
      for (let i = 0; i < allIncomes.length; i++) {
        let element = allIncomes[i];
        let journalC1: any = await this.ledger_details.sum("credit", {
          where: {
            adminid,
            ledgercategory: { [Op.notIn]: [24, 13], [Op.eq]: element.category }, //11
            ledger: Number(element.id),
            companyid,
            createdat: {
              [Op.gte]: sdate,
              [Op.lte]: edate,
            },
          },
        });

        let journalD1: any = await this.ledger_details.sum("debit", {
          where: {
            adminid,
            ledgercategory: { [Op.notIn]: [24, 13], [Op.eq]: element.category },
            ledger: Number(element.id),
            companyid,
            createdat: {
              [Op.gte]: sdate,
              [Op.lte]: edate,
            },
          },
        });

        if (journalC1 == null || journalC1 == "") {
          journalC1 = 0;
        }
        if (journalD1 == null || journalD1 == "") {
          journalD1 = 0;
        }
        let amount2 = Number(journalC1) - Number(journalD1);
        total2 = Number(total2) + Number(amount2);

        if (journalC1 || journalD1) {
          let detailedData = await this.ledger_details.findAllByQuery({
            where: {
              adminid,
              companyid,
              ledgercategory: {
                [Op.notIn]: [24, 13],
                [Op.eq]: element.category,
              },
              ledger: Number(element.id),
              createdat: {
                [Op.gte]: sdate,
                [Op.lte]: edate,
              },
            },
          });

          let ansArray = {
            amount: amount2,
            credit: journalC1,
            debit: journalD1,
            ledger: element.laccount,
            reference: element.nominalcode,
            category: element.category,
            id: element.id,
            total: total2,
            detailedData,
          };
          indirectIncomeData.push(ansArray);
        }
      }

      // direct income
      const directIncomeList = await this.account_master.findAllByQuery({
        attributes: ["id", "laccount", "nominalcode", "category", "opening"],
        where: {
          userid: {
            [Op.or]: ["-2", adminid],
          },
          category: 24,
        },
        order: [["id", "DESC"]],
      });

      if (directIncomeList) {
        for (var i = 0; i < directIncomeList.length; i++) {
          let element = directIncomeList[i];
          let journalC1: any = await this.ledger_details.sum("credit", {
            where: {
              adminid,
              companyid,
              ledgercategory: 24,
              ledger: Number(element.id),
              createdat: {
                [Op.gte]: sdate,
                [Op.lte]: edate,
              },
            },
          });

          let journalD1: any = await this.ledger_details.sum("debit", {
            where: {
              adminid,
              companyid,
              ledgercategory: 24,
              ledger: Number(element.id),
              createdat: {
                [Op.gte]: sdate,
                [Op.lte]: edate,
              },
            },
          });

          if (journalC1 == null || journalC1 == "") {
            journalC1 = 0;
          }
          if (journalD1 == null || journalD1 == "") {
            journalD1 = 0;
          }
          let amount = Number(journalC1) - Number(journalD1);
          totalDI = Number(totalDI) + Number(amount);

          if (journalC1 || journalD1) {
            let detailedData = await this.ledger_details.findAllByQuery({
              where: {
                adminid,
                companyid,
                ledgercategory: 24,
                ledger: Number(element.id),
                createdat: {
                  [Op.gte]: sdate,
                  [Op.lte]: edate,
                },
              },
            });

            let ansArray = {
              amount: amount,
              credit: journalC1,
              debit: journalD1,
              ledger: element.laccount,
              reference: element.nominalcode,
              category: element.category,
              id: element.id,
              total: totalDI,
              detailedData,
            };
            DIncome.push(ansArray);
          }
        }
      }

      // All Expenditure

      const expenditure = await this.account_master.findAllByQuery({
        attributes: ["id", "laccount", "nominalcode", "category", "opening"],
        where: {
          userid: {
            [Op.or]: ["-2", adminid],
          },
          categorygroup: 3,
        },
        order: [["id", "DESC"]],
      });

      // Purchase - direct expense

      const purchaseList = await this.account_master.findAllByQuery({
        attributes: ["id", "laccount", "nominalcode", "category", "opening"],
        where: {
          userid: {
            [Op.or]: ["-2", adminid],
          },
          category: "6",
        },
        order: [["id", "DESC"]],
      });

      if (purchaseList) {
        for (var i = 0; i < purchaseList.length; i++) {
          let element = purchaseList[i];
          let journalC1: any = await this.ledger_details.sum("credit", {
            where: {
              adminid,
              companyid,
              ledgercategory: 6,
              ledger: Number(element.id),
              createdat: {
                [Op.gte]: sdate,
                [Op.lte]: edate,
              },
              type: {
                [Op.notIn]: ["Purchase Credit Notes", "Purchase Invoice"],
              },
            },
          });
          let journalD1: any = await this.ledger_details.sum("debit", {
            where: {
              adminid,
              companyid,
              ledgercategory: 6,
              ledger: Number(element.id),
              createdat: {
                [Op.gte]: sdate,
                [Op.lte]: edate,
              },
              type: {
                [Op.notIn]: ["Purchase Credit Notes", "Purchase Invoice"],
              },
            },
          });

          if (journalC1 == null || journalC1 == "") {
            journalC1 = 0;
          }
          if (journalD1 == null || journalD1 == "") {
            journalD1 = 0;
          }
          let amount3 = Number(journalD1) - Number(journalC1);
          total3 = Number(total3) + Number(amount3);

          if (journalC1 || journalD1) {
            let detailedData: any = await this.ledger_details.findAllByQuery({
              where: {
                adminid,
                companyid,
                ledgercategory: 6,
                ledger: Number(element.id),
                createdat: {
                  [Op.gte]: sdate,
                  [Op.lte]: edate,
                },
                type: {
                  [Op.notIn]: ["Purchase Credit Notes", "Purchase Invoice"],
                },
              },
            });

            let ansArray = {
              amount: amount3,
              credit: journalC1,
              debit: journalD1,
              ledger: element.laccount,
              reference: element.nominalcode,
              category: element.category,
              id: element.id,
              total: total3,
              detailedData,
            };
            directExpenseData.push(ansArray);
          }
        }
      }
      // Purchase 2 - indirect expense
      for (let i = 0; i < expenditure.length; i++) {
        let element = expenditure[i];

        let journalC1: any = await this.ledger_details.sum("credit", {
          where: {
            adminid,
            companyid,
            ledgercategory: { [Op.ne]: 6, [Op.eq]: element.category },
            ledger: Number(element.id),
            createdat: {
              [Op.gte]: sdate,
              [Op.lte]: edate,
            },
          },
        });
        let journalD1: any = await this.ledger_details.sum("debit", {
          where: {
            adminid,
            companyid,
            ledgercategory: { [Op.ne]: 6, [Op.eq]: element.category },
            ledger: Number(element.id),
            createdat: {
              [Op.gte]: sdate,
              [Op.lte]: edate,
            },
          },
        });

        if (journalC1 == null || journalC1 == "") {
          journalC1 = 0;
        }
        if (journalD1 == null || journalD1 == "") {
          journalD1 = 0;
        }
        let amount4 = Number(journalD1) - Number(journalC1);
        total4 = Number(total4) + Number(amount4);

        if (journalC1 || journalD1) {
          let detailedData: any = await this.ledger_details.findAllByQuery({
            where: {
              adminid,
              companyid,
              ledgercategory: { [Op.ne]: 6, [Op.eq]: element.category },
              ledger: Number(element.id),
              createdat: {
                [Op.gte]: sdate,
                [Op.lte]: edate,
              },
            },
          });
          let ansArray = {
            amount: amount4,
            credit: journalC1,
            debit: journalD1,
            ledger: element.laccount,
            reference: element.nominalcode,
            category: element.category,
            id: element.id,
            total: total4,
            detailedData,
          };
          indirectExpenseData.push(ansArray);
        }
      }

      const [purchaseTotalResult] = await this.sequelize.query(
        `SELECT SUM(total - total_vat) as purchaseTotal
         FROM purchase_invoice
         WHERE adminid = :adminid
           AND companyid = :companyid
           AND ledger != 20835
           AND sdate BETWEEN :sdate AND :edate
           AND type = 'purchase'`,
        {
          replacements: { adminid, companyid, sdate, edate },
          type: sequelize.QueryTypes.SELECT
        }
      );

      const purchaseTotal = purchaseTotalResult["purchaseTotal"]

      const [purchaseDebitTotalResult] = await this.sequelize.query(
        `SELECT SUM(total - total_vat) as purchaseDebitTotal
         FROM purchase_invoice
         WHERE adminid = :adminid
           AND companyid = :companyid
           AND ledger != 20705
           AND sdate BETWEEN :sdate AND :edate
           AND type = 'pcredit'`,
        {
          replacements: { adminid, companyid, sdate, edate },
          type: sequelize.QueryTypes.SELECT
        }
      );
      const purchaseDebitTotal = purchaseDebitTotalResult['purchaseDebitTotal']

      const [salesTotalResult] = await this.sequelize.query(
        `SELECT SUM(total - total_vat) as salesTotal
         FROM sale_invoice
         WHERE adminid = :adminid
           AND companyid = :companyid
           AND ledger != 2
           AND sdate BETWEEN :sdate AND :edate
           AND type = 'sales'`, 
        {
          replacements: { adminid, companyid, sdate, edate },
          type: sequelize.QueryTypes.SELECT
        }
      );

      const salesTotal = salesTotalResult["salesTotal"]

      const [salesCreditTotalResult] = await this.sequelize.query(
        `SELECT SUM(total - total_vat) as salesCreditTotal
         FROM sale_invoice
         WHERE adminid = :adminid
           AND companyid = :companyid
           AND ledger != 20706
           AND sdate BETWEEN :sdate AND :edate
           AND type = 'scredit'`, 
        {
          replacements: { adminid, companyid, sdate, edate },
          type: sequelize.QueryTypes.SELECT
        }
      );

      const salesCreditTotal = salesCreditTotalResult["salesCreditTotal"]

      // opening
      let openingData = await this.stock_summary.getAllStockDataForOpening(
        adminid,
        companyid,
        sdate
      );
      const openingStocks = openingData.reduce(
        (accumulator, item) => accumulator + Number(item.value),
        0
      );

      let activePurchase = purchaseTotal - purchaseDebitTotal;
      let activeSales = salesTotal - salesCreditTotal;

      // closing balance
      let data = await this.stock_summary.getAllStockDataForClosing(
        adminid,
        companyid,
        edate
      );

      const totalClosingCost = data.reduce(
        (accumulator, item) => accumulator + Number(item.value),
        0
      );

      let grossCD =
        Number(openingStocks) +
        Number(activePurchase) +
        Number(total3) -
        Number(totalClosingCost) -
        Number(activeSales) -
        Number(totalDI);
      let indirectDiff = Number(total2) - Number(total4);
      let net = Number(grossCD) - Number(indirectDiff);

      let debitSideTotal;
      let creditSideTotal;

      let grandLeftTotal;
      let grandRightTotal;
      if (grossCD > 0) {
        debitSideTotal =
          Number(openingStocks) + Number(activePurchase) + Number(total3);
        creditSideTotal =
          Number(totalClosingCost) +
          Number(activeSales) +
          Number(totalDI) +
          Math.abs(grossCD);
      } else {
        debitSideTotal =
          Number(openingStocks) +
          Number(activePurchase) +
          Number(total3) +
          Math.abs(grossCD);
        creditSideTotal =
          Number(totalClosingCost) + Number(activeSales) + Number(totalDI);
      }

      if (net > 0) {
        grandLeftTotal = Math.abs(Number(total4)) + Math.abs(grossCD);
        grandRightTotal = Math.abs(Number(total2)) + Math.abs(net);
      } else {
        grandLeftTotal = Math.abs(Number(total4)) + Math.abs(net);
        grandRightTotal = Math.abs(Number(total2)) + Math.abs(grossCD);
      }

      let responseData = {
        values: {
          purchaseTotal: Number(purchaseTotal).toFixed(2),
          purchaseDebitTotal: Number(purchaseDebitTotal).toFixed(2),
          salesTotal: Number(salesTotal).toFixed(2),
          salesCreditTotal: Number(salesCreditTotal).toFixed(2),
          activePurchase: Number(activePurchase).toFixed(2),
          activeSales: Number(activeSales).toFixed(2),
          totalDirectIncome: Number(totalDI).toFixed(2),
          totalDirectExpense: Number(total3).toFixed(2),
          totalIndirectIcome: Number(total2).toFixed(2),
          totalIndirectExpense: Number(total4).toFixed(2),
          grossCD: Number(grossCD).toFixed(2),
          netProfit: Number(net).toFixed(2),
          debitSideTotal: Number(debitSideTotal).toFixed(2),
          creditSideTotal: Number(creditSideTotal).toFixed(2),
          grandLeftTotal: Number(grandLeftTotal).toFixed(2),
          grandRightTotal: Number(grandRightTotal).toFixed(2),
        },
        indirectIncomeList: indirectIncomeData,
        directexpenses: directExpenseData,
        directIncome: DIncome,
        indirectExpenseList: indirectExpenseData,
        openingStocks: Number(openingStocks),
        closingStocks: Number(totalClosingCost),
      };
      reponse = {
        status: true,
        message: "Profit and Loss Report",
        data: responseData,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
    return reponse;
  }

  getStockTotalamount(stockData: any) {
    let totalStockAmount: any = 0;
    for (let i = 0; i < stockData.length; i++) {
      const element = stockData[i];
      const currentStock =
        Number(element?.totalPurchaseQuantity) -
        Number(element?.totalCreditQuantity);
      const alltotalAmount =
        Number(element.totalAmountPurchase) -
        Number(element.totalAmountDebit) +
        Number(element.productMasterInfo.openingBalance);
      let allQuantity =
        Number(currentStock) + Number(element.productMasterInfo.stockquantity);
      let itemAmount = Number(alltotalAmount) / allQuantity;
      let lastStockAmountAfterSaleAndPurch =
        itemAmount *
        (Number(element.productMasterInfo.stock) +
          Number(element.productMasterInfo.stockquantity));
      totalStockAmount += lastStockAmountAfterSaleAndPurch;
    }

    return totalStockAmount;
  }

  async getLedgerDetails(
    id: number,
    companyid: number,
    sdate: string,
    ldate: string
  ) {
    try {
      const startdate = moment(sdate).startOf("day").toISOString();
      const enddate = moment(ldate).endOf("day").toISOString();

      let details = await this.ledger_details.findAllByQuery({
        where: {
          companyid: companyid,
          type: {
            [Op.not]: "Opening Balance",
          },
          sdate: {
            [Op.gte]: startdate,
            [Op.lte]: enddate,
          },
          ledger: id,
        },
      });

      let data = [];
      for (let i = 0; i < details.length; i++) {
        const element = details[i];
        let oppositeLedger = [];
        if (element.baseid !== null || element.baseid !== "") {
          oppositeLedger = await this.ledger_details.findAllByQuery({
            where: {
              companyid: companyid,
              sdate: {
                [Op.gte]: startdate,
                [Op.lte]: enddate,
              },
              id: element.baseid,
            },
            include: [
              {
                model: AccountMaster,
              },
            ],
          });
        } else {
          oppositeLedger = await this.ledger_details.findAllByQuery({
            where: {
              companyid: companyid,
              sdate: {
                [Op.gte]: startdate,
                [Op.lte]: enddate,
              },
              baseid: element.id,
            },
            include: [
              {
                model: AccountMaster,
              },
            ],
          });
        }
        let obj = {
          id: element.id,
          debit: element.credit,
          invoiceno:element.invoiceno,
          reference:element.reference,
          credit: element.debit,
          type: element.type,
          date: element.sdate,
          oppositeLedger: oppositeLedger[0]?.ledgerDetails?.laccount,
        };
        data.push(obj);
      }

      return new CommonResponseDto(data, true, "ledger details");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async staffReport(adminid: number, companyid: number) {
    try {
      const allStaffs = await this.contactMasterService.findAllByQuery({
        where: {
          adminid: adminid,
          companyid,
          contractors_type: "staff",
        },
        order: [["id", "asc"]],
        raw: true,
      });

      let allFilteredData = [];

      for (let i = 0; i < allStaffs.length; i++) {
        let element = allStaffs[i];

        const idByData = await this.findAllStaffTransactionList(
          adminid,
          companyid,
          element.id
        );
        idByData["staff"] = element;
        idByData["staffId"] = element.id;
        allFilteredData.push(idByData);
      }

      let currentMonth = new Date().getMonth() + 1;

      let filteredData = allFilteredData.map((item) => {
        let totaldebit = item.reduce((total, entry) => {
          if (entry.type) {
            if (entry.type === "sales") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);

        let totalCredit = item.reduce((total, entry) => {
          if (entry.type) {
            if (entry.type === "purchase") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Reciept" ||
              entry.type === "Other Receipt"
            ) {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        let currentMonthdebit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === currentMonth) {
            if (entry.type === "sales") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);

        let currentMonthCredit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === currentMonth) {
            if (entry.type === "purchase") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Other Receipt"
            ) {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        let prevMonthDebit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (
            entryMonth === (currentMonth - 1 + 12) % 12 ||
            (currentMonth === 1 && entryMonth === 12)
          ) {
            if (entry.type === "sales") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);
        let prevMonthCredit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (
            entryMonth === (currentMonth - 1 + 12) % 12 ||
            (currentMonth === 1 && entryMonth === 12)
          ) {
            if (entry.type === "purchase") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Other Receipt"
            ) {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        let lastThreeMonthsDebit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === (currentMonth - 2 + 12) % 12) {
            if (entry.type === "sales") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);
        let lastThreeMonthsCredit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === (currentMonth - 2 + 12) % 12) {
            if (entry.type === "purchase") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Other Receipt"
            ) {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);
        let lastFourMonthsDebit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === (currentMonth - 3 + 12) % 12) {
            if (entry.type === "sales" || entry.type === "pcredit") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Supplier Payment" ||
              entry.type === "Other Payment"
            ) {
              return total + Number(entry?.debit);
            }
          }
          return total;
        }, 0);
        let lastFourMonthsCredit = item.reduce((total, entry) => {
          let entryMonth = new Date(entry.sdate).getMonth() + 1;

          if (entryMonth === (currentMonth - 3 + 12) % 12) {
            if (entry.type === "purchase") {
              return total + Number(entry?.total);
            } else if (
              entry.type === "Customer Receipt" ||
              entry.type === "Other Receipt"
            ) {
              return total + Number(entry?.credit);
            }
          }
          return total;
        }, 0);

        let staff = item.staff;
        let staffId = item.staffId;
        const totalPrice = Number(totaldebit) - Number(totalCredit);
        const lastFourMonthsTotal =
          Number(lastFourMonthsDebit) - Number(lastFourMonthsCredit);
        const lastThreeMonthsTotal =
          Number(lastThreeMonthsDebit) -
          Number(lastThreeMonthsCredit) +
          Number(lastFourMonthsTotal);
        const lastTwoMonthsTotal =
          Number(prevMonthDebit) -
          Number(prevMonthCredit) +
          Number(lastThreeMonthsTotal);
        const currentMonthTotal =
          Number(currentMonthdebit) -
          Number(currentMonthCredit) +
          Number(lastTwoMonthsTotal);
        return {
          currentMonthTotal: Number(currentMonthTotal).toFixed(2),
          id: staffId,
          staff_name: staff.name,
          totalPrice: Number(totalPrice).toFixed(2),
          lastTwoMonthsTotal: Number(lastTwoMonthsTotal).toFixed(2),
          lastThreeMonthsTotal: Number(lastThreeMonthsTotal).toFixed(2),
          lastFourMonthsTotal: Number(lastFourMonthsTotal).toFixed(2),
          staff: staff,
        };
      });
      return filteredData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllStaffTransactionList(
    adminid: number,
    staffid: number,
    companyid: number
  ) {
    try {
      const saleList = await this.sale_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          companyid,
          type: "sales",
          createdBy: staffid,
        },
        order: [["id", "DESC"]],
      });

      const purchace = await this.purchase_invoice.findAllByQuery({
        where: {
          adminid: adminid,
          companyid,
          type: "purchase",
          createdBy: staffid,
        },
        order: [["id", "DESC"]],
      });

      let transactions = await this.StaffTransactionsService.findAllByQuery({
        where: {
          adminid,
          companyid,
          staffid,
        },
        order: [["id", "DESC"]],
      });

      let transactionData = transactions.map((item: any) => {
        return {
          date: item.createdat,
          type: item.type,
          debit:
            item?.type === "Supplier Payment" || item?.type === "Other Payment"
              ? item.paid_amount
              : "0.00",
          credit:
            item?.type === "Customer Receipt" || item?.type === "Other Receipt"
              ? item.paid_amount
              : "0.00",
          invoiceno: item.invoiceno,
          id: item.id,
          particular: "Cash",
        };
      });

      const allDatas = [...purchace, ...saleList, ...transactionData];
      return allDatas;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async HsnCodeReport(companyid: number, hsnCode: string) {
    try {
      const productList = await this.productMasterService.findByHsnCode(
        companyid,
        hsnCode
      );

      let result = [];
      for (let i = 0; i < productList.data.length; i++) {
        const element = productList.data[i];
        const invoiceData = await this.invoiceItemsService.findAllByQuery({
          where: {
            idescription: element.id,
          },
        });
        let data = {
          idescription: element.idescription,
          icode: element.icode,
          itemtype: element.itemtype,
          product_category: element.product_category,
          vatamt: element.vatamt,
          stock: element.stock,
          invoiceData,
        };
        result.push(data);
      }
      return new CommonResponseDto(result, true, "HSN/SAC Report");
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Category Sales Report for logged-in user's company
   * Shows sales data for products in a specific category for the user's branch
   */
  async categorySalesForUser(
    userId: number,
    categoryName?: string,
    startDate?: string,
    endDate?: string,
    companyId?: number,
    dateFilter?: string
  ) {
    try {
      // companyId is required
      if (!companyId) {
        return new CommonResponseDto([], false, "companyId is required");
      }

      const targetCompanyId = companyId;

      // Get company details including adminid
      const companyQuery = `
        SELECT id, bname as companyName, adminid
        FROM company_master
        WHERE id = :companyId
        AND deleted_at IS NULL
        LIMIT 1
      `;

      const companies: any = await this.sequelize.query(companyQuery, {
        replacements: { companyId: targetCompanyId },
        type: sequelize.QueryTypes.SELECT,
      });

      if (!companies || companies.length === 0) {
        return new CommonResponseDto([], false, "Company not found");
      }

      const company = companies[0];
      const adminId = company.adminid;

      // Find category by name using the company's adminid
      let categoryId: number | undefined;

      if (categoryName) {
        const categoryLookupQuery = `
          SELECT DISTINCT pc.id, pc.category
          FROM product_category pc
          INNER JOIN product_master pm ON pm.product_category = pc.id
          WHERE LOWER(TRIM(pc.category)) = LOWER(TRIM(:categoryName))
          AND pm.companyid = :companyId
          AND (pc.isDeleted = 0 OR pc.isDeleted IS NULL)
          AND (pm.is_deleted = 0 OR pm.is_deleted IS NULL)
          LIMIT 1
        `;

        const categoryResult: any = await this.sequelize.query(categoryLookupQuery, {
          replacements: { categoryName, companyId: targetCompanyId },
          type: sequelize.QueryTypes.SELECT,
        });

        if (!categoryResult || categoryResult.length === 0) {
          return new CommonResponseDto(
            [],
            false,
            `Category '${categoryName.trim()}' not found for this branch`
          );
        }

        categoryId = categoryResult[0].id;
        console.log(`Found category: ${categoryResult[0].category} (ID: ${categoryId}) for company ${targetCompanyId}`);
      }

      // Build date filter for orders
      let orderDateFilter = '';
      const replacements: any = { companyId: targetCompanyId, categoryId };

      // Handle predefined date filters
      if (dateFilter) {
        switch (dateFilter.toLowerCase()) {
          case 'yesterday':
            startDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
            endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
            break;
          case 'today':
            startDate = moment().format('YYYY-MM-DD');
            endDate = moment().format('YYYY-MM-DD');
            break;
          case 'lastweek':
            startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
            endDate = moment().format('YYYY-MM-DD');
            break;
          case 'lastmonth':
            startDate = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
            endDate = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
            break;
          case 'thismonth':
            startDate = moment().startOf('month').format('YYYY-MM-DD');
            endDate = moment().format('YYYY-MM-DD');
            break;
        }
      }

      if (startDate && endDate) {
        orderDateFilter = `AND (om.createdAt BETWEEN :startDate AND :endDate OR om.createdat BETWEEN :startDate AND :endDate)`;
        replacements.startDate = moment(startDate).startOf('day').toDate();
        replacements.endDate = moment(endDate).endOf('day').toDate();
      }

      // Get product sales data
      const categoryCondition = categoryId
        ? `AND pm.product_category = :categoryId`
        : '';

      const productSalesQuery = `
        SELECT
          pm.id as productId,
          COALESCE(pm.idescription, pm.name) as productName,
          COALESCE(SUM(CASE WHEN om.id IS NOT NULL THEN oi.quantity ELSE 0 END), 0) as quantitySold,
          COALESCE(SUM(CASE WHEN om.id IS NOT NULL THEN oi.quantity * oi.sp_price ELSE 0 END), 0) as salesValue,
          COUNT(DISTINCT om.id) as numberOfInvoices,
          CASE
            WHEN SUM(CASE WHEN om.id IS NOT NULL THEN oi.quantity ELSE 0 END) > 0
            THEN SUM(CASE WHEN om.id IS NOT NULL THEN oi.quantity * oi.sp_price ELSE 0 END) / SUM(CASE WHEN om.id IS NOT NULL THEN oi.quantity ELSE 0 END)
            ELSE 0
          END as averagePrice
        FROM product_master pm
        LEFT JOIN order_items oi ON pm.id = oi.productId
        LEFT JOIN order_master om ON oi.orderId = om.id
          AND om.orderStatus != 'cancelled'
          ${orderDateFilter}
        WHERE pm.companyid = :companyId
        ${categoryCondition}
        AND (pm.is_deleted = 0 OR pm.is_deleted IS NULL)
        GROUP BY pm.id, pm.idescription, pm.name
        ORDER BY salesValue DESC
      `;

      const productSalesData: any = await this.sequelize.query(productSalesQuery, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      });

      console.log(`Found ${productSalesData.length} products in category ${categoryId} for company ${targetCompanyId}`);
      console.log(`Date filter applied: ${startDate} to ${endDate}`);
      console.log(`Total sales: ${productSalesData.reduce((sum, p) => sum + parseFloat(p.quantitySold || 0), 0)} items`);
      console.log(`Total invoices: ${productSalesData.reduce((sum, p) => sum + parseInt(p.numberOfInvoices || 0), 0)}`);
      if (productSalesData.length > 0) {
        console.log('First 3 products:', productSalesData.slice(0, 3).map(p => ({
          id: p.productId,
          name: p.productName,
          sold: p.quantitySold,
          invoices: p.numberOfInvoices
        })));
      }

      // Calculate totals
      const totalQuantitySold = productSalesData.reduce((sum, p) => sum + parseFloat(p.quantitySold || 0), 0);
      const totalSalesValue = productSalesData.reduce((sum, p) => sum + parseFloat(p.salesValue || 0), 0);
      const totalInvoices = productSalesData.reduce((sum, p) => sum + parseInt(p.numberOfInvoices || 0), 0);

      const result = {
        companyId: company.id,
        companyName: company.companyName,
        categoryName: categoryName || 'All Categories',
        dateRange: startDate && endDate ? { startDate, endDate } : 'All Time',
        productCount: productSalesData.length,
        totalQuantitySold,
        totalSalesValue,
        totalInvoices,
        products: productSalesData.map((p: any) => ({
          productId: p.productId,
          productName: p.productName,
          quantitySold: parseFloat(p.quantitySold || 0),
          salesValue: parseFloat(p.salesValue || 0),
          numberOfInvoices: parseInt(p.numberOfInvoices || 0),
          averagePrice: parseFloat(p.averagePrice || 0),
        })),
      };

      return new CommonResponseDto([result], true, "Category sales report generated successfully");
    } catch (error) {
      console.error("Error generating category sales report:", error);
      return new CommonResponseDto(
        [],
        false,
        `Failed to generate category sales report: ${error.message}`
      );
    }
  }

  /**
   * Product Category Report by Company (Branch)
   * Shows which companies have products in each category
   * Even displays companies with 0 products in a category
   */
  async productCategoryByCompanyReport(
    adminid: number,
    categoryId?: number,
    categoryName?: string,
    startDate?: string,
    endDate?: string,
    companyId?: number
  ) {
    try {
      // Get all companies for this admin (or specific company if companyId provided)
      const companyFilter = companyId ? `AND id = :companyId` : '';

      const companiesQuery = `
        SELECT
          id,
          bname as companyName
        FROM company_master
        WHERE adminid = :adminid
        AND deleted_at IS NULL
        ${companyFilter}
        ORDER BY bname
      `;

      const companies: any[] = await this.sequelize.query(companiesQuery, {
        replacements: { adminid, companyId },
        type: sequelize.QueryTypes.SELECT,
      });

      if (!companies || companies.length === 0) {
        return new CommonResponseDto([], true, "No companies found for this user");
      }

      // If categoryName is provided, look up the category ID
      if (categoryName && !categoryId) {
        console.log("Looking up category:", categoryName);

        // First, check ALL categories with this name and which companies have products
        // Use TRIM to handle inconsistent spacing in category names
        const allCategoriesWithNameQuery = `
          SELECT
            pc.id as categoryId,
            pc.category as categoryName,
            pm.companyid,
            COUNT(pm.id) as productCount
          FROM product_category pc
          LEFT JOIN product_master pm ON pm.product_category = pc.id
            AND (pm.is_deleted = 0 OR pm.is_deleted IS NULL)
          WHERE pc.userid = :adminid
          AND TRIM(pc.category) = TRIM(:categoryName)
          AND (pc.isDeleted = 0 OR pc.isDeleted IS NULL)
          GROUP BY pc.id, pc.category, pm.companyid
          HAVING productCount > 0
          ORDER BY pm.companyid
        `;

        const allMatchingCategories: any = await this.sequelize.query(allCategoriesWithNameQuery, {
          replacements: { adminid, categoryName },
          type: sequelize.QueryTypes.SELECT,
        });

        console.log(`\n=== ALL "${categoryName}" CATEGORIES ===`);
        console.log(`Found ${allMatchingCategories.length} category-company combinations:`);
        allMatchingCategories.forEach((cat: any) => {
          console.log(`  Category ID ${cat.categoryId} -> Company ${cat.companyid}: ${cat.productCount} products`);
        });
        console.log(`Looking for companyId: ${companyId}`);
        console.log(`======================\n`);

        // If companyId is specified, find the category that has products for this company
        // Use TRIM to handle inconsistent spacing in category names
        const categoryLookupQuery = companyId
          ? `
            SELECT DISTINCT pc.id, pc.category
            FROM product_category pc
            INNER JOIN product_master pm ON pm.product_category = pc.id
            WHERE pc.userid = :adminid
            AND TRIM(pc.category) = TRIM(:categoryName)
            AND pm.companyid = :companyId
            AND (pc.isDeleted = 0 OR pc.isDeleted IS NULL)
            AND (pm.is_deleted = 0 OR pm.is_deleted IS NULL)
            LIMIT 1
          `
          : `
            SELECT id, category
            FROM product_category
            WHERE userid = :adminid
            AND TRIM(category) = TRIM(:categoryName)
            AND (isDeleted = 0 OR isDeleted IS NULL)
            LIMIT 1
          `;

        const categoryResult: any[] = await this.sequelize.query(categoryLookupQuery, {
          replacements: { adminid, categoryName, companyId },
          type: sequelize.QueryTypes.SELECT,
        });

        console.log("Category lookup result:", categoryResult);

        if (categoryResult && categoryResult.length > 0) {
          categoryId = categoryResult[0].id;
          console.log("Found category ID:", categoryId);
        } else {
          console.log("Category not found, checking all categories...");
          // Try to find similar categories
          const allCategoriesQuery = `
            SELECT DISTINCT TRIM(category) as category
            FROM product_category
            WHERE userid = :adminid
            AND (isDeleted = 0 OR isDeleted IS NULL)
            ORDER BY category
            LIMIT 20
          `;
          const allCategories = await this.sequelize.query(allCategoriesQuery, {
            replacements: { adminid },
            type: sequelize.QueryTypes.SELECT,
          });
          console.log("Available categories:", allCategories);

          return new CommonResponseDto(
            [],
            false,
            `Category '${categoryName.trim()}' not found for the specified company. Available categories: ${allCategories.map((c: any) => c.category).join(', ')}`
          );
        }
      }

      // Get all product categories for this admin
      const categoryFilter = categoryId ? `AND pc.id = :categoryId` : '';

      const categoriesQuery = `
        SELECT DISTINCT
          pc.id as categoryId,
          pc.category as categoryName,
          pc.alias_name as aliasName
        FROM product_category pc
        WHERE pc.userid = :adminid
        AND (pc.isDeleted = 0 OR pc.isDeleted IS NULL)
        ${categoryFilter}
        ORDER BY pc.category
      `;

      const categories: any[] = await this.sequelize.query(categoriesQuery, {
        replacements: { adminid, categoryId },
        type: sequelize.QueryTypes.SELECT,
      });

      if (!categories || categories.length === 0) {
        return new CommonResponseDto([], true, "No product categories found");
      }

      // If filtering by specific category, also add uncategorized products section
      if (categoryId) {
        categories.push({
          categoryId: 0,
          categoryName: 'Uncategorized Products',
          aliasName: 'Products without category',
        });
      }

      // Build date filter if provided
      let dateFilter = '';
      const replacements: any = { adminid };

      if (startDate && endDate) {
        dateFilter = `AND pm.createdat BETWEEN :startDate AND :endDate`;
        replacements.startDate = moment(startDate).startOf('day').toDate();
        replacements.endDate = moment(endDate).endOf('day').toDate();
      }

      // For each category, get data for all companies
      const reportData = [];

      for (const category of categories) {
        const companyCategoryData = [];
        let totalProducts = 0;
        let totalValue = 0;

        for (const company of companies) {
          // Query sales data for products in this company and category
          // If categoryId is 0, get uncategorized products (NULL or 0 category)
          const categoryCondition = category.categoryId === 0
            ? `AND (pm.product_category IS NULL OR pm.product_category = 0)`
            : `AND pm.product_category = :categoryId`;

          // Build date filter for orders (using both possible column names)
          let orderDateFilter = '';
          if (startDate && endDate) {
            orderDateFilter = `AND (om.createdAt BETWEEN :startDate AND :endDate OR om.createdat BETWEEN :startDate AND :endDate)`;
          }

          // First, let's check ALL products to debug
          // Check what categories exist for this company
          const categoriesQuery = `
            SELECT DISTINCT
              pc.id as categoryId,
              pc.category as categoryName,
              COUNT(pm.id) as productCount
            FROM product_category pc
            LEFT JOIN product_master pm ON pm.product_category = pc.id
              AND pm.companyid = :companyId
              AND (pm.is_deleted = 0 OR pm.is_deleted IS NULL)
            WHERE pc.userid = :adminid
            AND (pc.isDeleted = 0 OR pc.isDeleted IS NULL)
            GROUP BY pc.id, pc.category
            HAVING productCount > 0
            ORDER BY categoryName
          `;

          const availableCategories: any = await this.sequelize.query(categoriesQuery, {
            replacements: {
              adminid,
              companyId: company.id,
            },
            type: sequelize.QueryTypes.SELECT,
          });

          console.log(`\n=== DIAGNOSTIC INFO ===`);
          console.log(`Company: ${company.companyName} (ID: ${company.id})`);
          console.log(`Looking for category: "${categoryName}" (ID: ${category.categoryId})`);
          console.log(`\nAvailable categories with products:`);
          availableCategories.forEach((cat: any) => {
            console.log(`  - ${cat.categoryName} (ID: ${cat.categoryId}) - ${cat.productCount} products`);
          });
          console.log(`======================\n`);

          // Check if there are any orders for products in this category
          const checkOrdersQuery = `
            SELECT
              pm.id,
              COALESCE(pm.idescription, pm.name) as productName,
              COUNT(oi.id) as orderItemCount,
              COUNT(DISTINCT om.id) as orderCount,
              GROUP_CONCAT(DISTINCT om.orderStatus) as statuses
            FROM product_master pm
            LEFT JOIN order_items oi ON pm.id = oi.productId
            LEFT JOIN order_master om ON oi.orderId = om.id
            WHERE pm.adminid = :adminid
            AND pm.companyid = :companyId
            ${categoryCondition}
            AND (pm.is_deleted = 0 OR pm.is_deleted IS NULL)
            GROUP BY pm.id
            LIMIT 5
          `;

          const orderCheck: any = await this.sequelize.query(checkOrdersQuery, {
            replacements: {
              adminid,
              companyId: company.id,
              categoryId: category.categoryId,
            },
            type: sequelize.QueryTypes.SELECT,
          });

          console.log(`\n=== ORDER CHECK FOR CATEGORY ${category.categoryId} ===`);
          console.log(`Sample products and their orders:`);
          orderCheck.forEach((p: any) => {
            console.log(`  Product ${p.id} (${p.productName}): ${p.orderItemCount} order items, ${p.orderCount} orders, statuses: ${p.statuses}`);
          });
          console.log(`======================\n`);

          // Get product sales details
          const productSalesQuery = `
            SELECT
              pm.id as productId,
              COALESCE(pm.idescription, pm.name) as productName,
              COALESCE(SUM(oi.quantity), 0) as quantitySold,
              COALESCE(SUM(oi.quantity * oi.sp_price), 0) as salesValue,
              COUNT(DISTINCT CASE WHEN om.id IS NOT NULL THEN om.id END) as numberOfInvoices,
              CASE
                WHEN SUM(oi.quantity) > 0
                THEN SUM(oi.quantity * oi.sp_price) / SUM(oi.quantity)
                ELSE 0
              END as averagePrice
            FROM product_master pm
            INNER JOIN order_items oi ON pm.id = oi.productId
            INNER JOIN order_master om ON oi.orderId = om.id AND om.orderStatus = 'finished'
            WHERE pm.adminid = :adminid
            AND pm.companyid = :companyId
            ${categoryCondition}
            AND (pm.is_deleted = 0 OR pm.is_deleted IS NULL)
            ${orderDateFilter}
            GROUP BY pm.id, pm.idescription, pm.name
            ORDER BY salesValue DESC
          `;

          const productSalesData: any[] = await this.sequelize.query(productSalesQuery, {
            replacements: {
              ...replacements,
              companyId: company.id,
              categoryId: category.categoryId,
            },
            type: sequelize.QueryTypes.SELECT,
          });

          // Calculate totals
          const productCount = productSalesData.length;
          const totalQuantitySold = productSalesData.reduce((sum, p) => sum + parseFloat(p.quantitySold || 0), 0);
          const totalSalesValue = productSalesData.reduce((sum, p) => sum + parseFloat(p.salesValue || 0), 0);
          const totalInvoices = productSalesData.reduce((sum, p) => sum + parseInt(p.numberOfInvoices || 0), 0);

          totalProducts += productCount;
          totalValue += totalSalesValue;

          // Format product details
          const products = productSalesData.map(p => ({
            productId: p.productId,
            productName: p.productName,
            quantitySold: parseFloat(p.quantitySold) || 0,
            salesValue: parseFloat(p.salesValue) || 0,
            numberOfInvoices: parseInt(p.numberOfInvoices) || 0,
            averagePrice: parseFloat(p.averagePrice) || 0,
          }));

          companyCategoryData.push({
            companyId: company.id,
            companyName: company.companyName,
            productCount: productCount,
            totalQuantitySold: totalQuantitySold,
            totalSalesValue: totalSalesValue,
            totalInvoices: totalInvoices,
            hasProducts: productCount > 0,
            products: products,
          });
        }

        reportData.push({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          aliasName: category.aliasName,
          companies: companyCategoryData,
          totalProducts: totalProducts,
          totalValue: totalValue,
        });
      }

      return new CommonResponseDto(
        reportData,
        true,
        "Product Category by Company Report generated successfully"
      );
    } catch (error) {
      console.log("Error in productCategoryByCompanyReport:", error);
      console.log("Error details:", error.message);
      console.log("Error stack:", error.stack);
      throw new HttpException(
        `Failed to generate category report: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
