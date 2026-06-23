import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { CommonResponseDto } from "../shared/dto/common-response.dto";
import { Op } from "sequelize";
import { UserService } from "../users/user.services";
import { PurchaseInvoiceService } from "../purchase_invoice/purchase_invoice_service";
import { SalesInvoiceService } from "../sale_invoice/sale_invoice_service";
import { AccountMasterService } from "../account_master/account_master_service";
import { ContactMasterService } from "../contactMaster/contactMasterService";
import { LedgerDetailsService } from "../ledger_details/ledger_details_service";
import { LedgerCategoryService } from "../ledger_category/ledger_category_service";
import { CountriesService } from "../countries/countries_service";
import { TaxService } from "../tax_master/tax_master_service";
import { InvoiceItemsService } from "../invoice_item/invoice_item_service";
import { ProductMasterService } from "../product_master/product_master_service";
import moment from "moment";
import { CompanyMasterService } from "../company_master/company_master_service";

@Injectable()
export class VatReportService {
  @Inject(AccountMasterService)
  private readonly account_master: AccountMasterService;

  @Inject(LedgerDetailsService)
  private readonly ledger_details: LedgerDetailsService;

  @Inject(ContactMasterService)
  private readonly contactMasterService: ContactMasterService;

  @Inject(LedgerCategoryService)
  private readonly ledgerCategory: LedgerCategoryService;

  @Inject(CompanyMasterService)
  private readonly companyMasterService: CompanyMasterService;
  @Inject(UserService)
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

  constructor() { }

  async overallVatReport(userid, companyid, fdate, lastdate) {
    let response = new CommonResponseDto('', false, 'No Data Found');
    try {
      let sdate = moment(fdate).startOf("day").toISOString();
      let ldate = moment(lastdate).endOf("day").toISOString();
      const userInfo: any = await this?.user?.getUser(userid);
      const companyInfo: any =
        await this?.companyMasterService?.getCompanyMaster(companyid);
      if (userInfo.status) {
        const reportType = companyInfo.reporttype;
        const adminid = userid;
        let condition: any = {
          adminid: adminid,
          companyid,
          status: [1, 2],
          paymentdate: {
            [Op.gte]: sdate,
            [Op.lte]: ldate,
          },
        };
        if (reportType != 1) {
          condition = {
            adminid: adminid,
            companyid,
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
        const taxRate: any = await this.tax_master.findAllByCompany(userid, companyid);
        let count = 0;
        let overAllVat = [];

        for (var i = 0; i < taxRate.data.length; i++) {
          let element = taxRate.data[i];

          count++;
          const getAllSales = await this.invoiceItemsService.findAllByQuery({
            where: {
              adminid: adminid,
              companyid,
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
              companyid,
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
                companyid,
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
                companyid,
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
          } else {
            response = {
              status: false,
              message: "null",
              data: '',
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
      throw error
    }
    return response;
  }

  async getNominalVat(adminid, companyid, id, ledger, fdate, ladate) {
    let response: CommonResponseDto;
    let sdate = new Date(new Date(fdate).setHours(0, 0, 0, 0));
    let ldate = new Date(new Date(ladate).setHours(23, 59, 59, 59));
    let saleType = "Sales Invoice";
    if (ledger == 54) {
      saleType = "Sales Invoice";
    } else {
      saleType = "Purchase Invoice";
    }

    try {

      const userInfo: any = await this.user.getUser(adminid);

      if (!userInfo.status) {
        throw new HttpException({ message: "user not found" }, HttpStatus.OK);
      }
      const company = await this.companyMasterService.findOne(companyid);
      const stateOfCompany = company.state;
      const taxtype = company.tax;
      const reportType = company.reporttype;
      let whereClause: any = {
        adminid: Number(adminid),
        companyid,
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
            cName = customerDetails.data.name;
            debit = element.incomeTaxAmount;
            credit = 0;
            total = Number(credit) - Number(debit);
            runningtotal += Number(total);
          } else if (element.booleantype == 25) {
            cName = supplierDetails.data.name;
            credit = element.incomeTaxAmount;
            debit = 0;
            total = Number(credit) - Number(debit);
            runningtotal += Number(total);
          } else {
            runningtotal += 0;
          }
          let nList: any = {
            productname: productName,
            name: cName,
            id: element.id,
            date: element.sdate,
            credit,
            debit,
            incometax: element.incomeTax,
            incometaxamount: element.incomeTaxAmount,
            total: element.total,
            invoiceno: element.invoiceno,
            invoicIdPurchase: element.purchaseid,
            invoicId: element.saleid,
            taxtype: taxtype,
            invoicType: element.type,
            runningtotal: Number(runningtotal).toFixed(2),
          };
          if (taxtype === "gst") {
            console.log(
              customerDetails.data.state,
              stateOfCompany,
              customerDetails.data.state === stateOfCompany
            );
            if (customerDetails.data.state === stateOfCompany) {
              nList = {
                ...nList,
                sgst: Number(element.incomeTaxAmount) / 2,
                cgst: Number(element.incomeTaxAmount) / 2,
                igst: null,
              };
            } else {
              nList = {
                ...nList,
                sgst: null,
                cgst: null,
                igst: element.incomeTaxAmount,
              };
            }
          }
          // purchaseid

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
      console.log("===>");
      throw error
    }
    return response;
  }

  async getVatNominalList(id, adminid, companyid, fdate, ladate) {
    let response: CommonResponseDto;
    let sdate = new Date(new Date(fdate).setHours(0, 0, 0, 0));
    let ldate = new Date(new Date(ladate).setHours(23, 59, 59, 59));
    let saleType = "Sales Invoice";
    if (id == 54) {
      saleType = "Sales Invoice";
    } else {
      saleType = "Purchase Invoice";
    }

    try {

      const userInfo: any = await this.user.getUser(adminid);

      if (!userInfo.status) {
        throw new HttpException({ message: "user not found" }, HttpStatus.OK);
      }
      const company = await this.companyMasterService.findOne(companyid);
      const reportType = company.reporttype;
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
        companyid,
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
          companyid,
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
      console.log(error)
      throw error
    }
    return response;
  }
}
