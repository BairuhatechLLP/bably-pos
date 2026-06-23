import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
const moment = require("moment");

@Injectable()
export class SalesInvoiceHelperService {
  constructor() {}
  async createInvoiceLineItem(createInvoice: any, createSalesInvoiceDto: any) {
    try {
      let invoiceItems = [];
      let totalVat = 0;
      let ledgerAcc = createSalesInvoiceDto.ledger;
      let totalNet = 0;
      let uniqueVat = [];
      let index = 0;
      for (
        let i = 0;
        i < createSalesInvoiceDto?.columns?.length ||
        createSalesInvoiceDto?.item?.length;
        i++
      ) {
        let element = createSalesInvoiceDto.columns[i];
        const costprice = element.costprice;
        const quantity = element.quantity;
        const totalamount = Number(costprice) * Number(quantity);
        const incomeTax = element.incomeTax;
        const incomeTaxAmount = Number(element.vatamount);
        totalVat += incomeTaxAmount;
        totalNet += totalamount;
        uniqueVat.push(element.incomeTax);

        let saleItem: any = {
          saleid: createInvoice?.id,
          idescription: element?.product?.id,
          sdate: createSalesInvoiceDto?.sdate,
          ldate: createSalesInvoiceDto?.ldate,
          ledger: ledgerAcc?.id,
          cname: createSalesInvoiceDto?.customerid,
          total: element?.total,
          percentage: element?.percentage,
          costprice: element?.costprice,
          quantity: element?.quantity,
          userid: createSalesInvoiceDto?.userid,
          ledgercategory: ledgerAcc?.category,
          adminid: createSalesInvoiceDto?.adminid || 0,
          userdate: createSalesInvoiceDto?.userdate,
          type:
            createSalesInvoiceDto?.type == "sales"
              ? "Sales Invoice"
              : createSalesInvoiceDto?.type == "scredit"
              ? "Sales Credit Notes"
              : "Proforma Invoice",
          incomeTax: element?.incomeTax,
          incomeTaxAmount: element?.incomeTaxAmount,
          vatamt: element?.incomeTaxAmount,
          vat: element?.incomeTax,
          includevat: element?.includevat ? 1 : 0,
          totalamount: element?.total,
          discount: element?.discount,
          discount_amount: element?.discountamt,
          description: element?.description,
          booleantype: "1",
          usertype: "customer",
          used: "group",
          invoiceno: createInvoice?.invoiceno,
          baseid: "",
          itemorder: element?.itemorder || index + 1,
          invoiceid: createSalesInvoiceDto.invoiceid,
          createdBy: createSalesInvoiceDto.createdBy,
          companyid: createSalesInvoiceDto.companyid,
          productLocationRef: element.productLocationRef,
          seriesNo: createSalesInvoiceDto.seriesNo,
          // parcel_quantity: createSalesInvoiceDto.parcel_quantity,
          // dine_in_quantity: createSalesInvoiceDto.dine_in_quantity,
          // parcel_charge_per_item: createSalesInvoiceDto.parcel_charge_per_item,
          imei: element?.imei && element?.imei?.length ? element?.imei : [],
        };
        invoiceItems.push(saleItem);
      }
      return invoiceItems;
    } catch (error) {
      console.log(" === ==== ==== ===  helper error ->", error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async createInvoiceLineItems(createInvoice: any, createSalesInvoiceDto: any) {
    try {
      let invoiceItems = [];
      let totalVat = 0;
      let ledgerAcc = {};
      let totalNet = 0;
      let uniqueVat = [];
      let index = 0;
      const todaysDate = moment();
      for (
        let i = 0;
        i < createSalesInvoiceDto?.columns?.length ||
        createSalesInvoiceDto?.item?.length;
        i++
      ) {
        let element = createSalesInvoiceDto.columns[i];
        const costprice = element.costprice;
        const quantity = element.quantity;
        const totalamount = Number(costprice) * Number(quantity);
        const incomeTax = element.vat;
        const incomeTaxAmount = element.vatamount;
        totalVat += incomeTaxAmount;
        totalNet += totalamount;
        uniqueVat.push(element.vat);

        let saleItem: any = {
          saleid: createInvoice?.id,
          idescription: element?.product?.id,
          sdate: todaysDate,
          ldate: todaysDate,
          ledger: 1,
          cname: createSalesInvoiceDto?.customerid,
          total: element?.total,
          percentage: element?.percentage,
          costprice: element?.costprice,
          quantity: element?.quantity,
          userid: createSalesInvoiceDto?.userid,
          ledgercategory: 13,
          adminid: createSalesInvoiceDto?.adminid || 0,
          userdate: createSalesInvoiceDto?.userdate || todaysDate,
          type: "Sales Invoice",
          incomeTax: element?.vat,
          incomeTaxAmount: element?.vatamount,
          vatamt: element?.vatamount,
          vat: element?.vat,
          includevat: element?.includevat ? 1 : 0,
          totalamount: element?.total,
          discount: element?.discount,
          discount_amount: element?.discountamt,
          description: element?.description,
          booleantype: "1",
          usertype: "customer",
          used: "group",
          invoiceno: createInvoice?.invoiceno,
          baseid: "",
          itemorder: element?.itemorder || index + 1,
          invoiceid: createSalesInvoiceDto?.invoiceid,
          createdBy: createSalesInvoiceDto.createdBy,
          companyid: createSalesInvoiceDto.companyid,
          seriesNo: createSalesInvoiceDto.seriesNo,
          imei: element?.imei && element?.imei?.length ? element?.imei : [],
        };
        invoiceItems.push(saleItem);
      }
      return invoiceItems;
    } catch (error) {
      console.log(" === ==== ==== ===  helper error ->", error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //for reccuring sales
  async createInvoiceLineItemOnly(
    createInvoice: any,
    createSalesInvoiceDto: any
  ) {
    // console.log('<-  === ==== inside createInvoiceLineItemOnly ==== ===  ->', createInvoice);
    try {
      let invoiceItems = [];
      let totalVat = 0;
      let ledgerAcc = createSalesInvoiceDto.ledger;
      let totalNet = 0;
      let uniqueVat = [];
      let index = 0;
      for (
        let i = 0;
        i < createSalesInvoiceDto?.columns?.length ||
        createSalesInvoiceDto?.item?.length;
        i++
      ) {
        let element = createSalesInvoiceDto.columns[i];
        const costprice = element.costprice;
        const quantity = element.quantity;
        const totalamount = Number(costprice) * Number(quantity);
        const incomeTax = element.incomeTax;
        const incomeTaxAmount = element.vatamount;
        totalVat += incomeTaxAmount;
        totalNet += totalamount;
        uniqueVat.push(element.incomeTax);

        let saleItem: any = {
          saleid: createInvoice?.id,
          idescription: element?.product.id,
          sdate: createSalesInvoiceDto?.sdate,
          ldate: createSalesInvoiceDto?.ldate,
          ledger: ledgerAcc?.id,
          cname: createSalesInvoiceDto?.customerid,
          total: element?.total,
          percentage: element?.percentage,
          costprice: element?.costprice,
          quantity: element?.quantity,
          userid: createSalesInvoiceDto?.userid,
          ledgercategory: ledgerAcc?.category,
          adminid: createSalesInvoiceDto?.adminid || 0,
          userdate: createSalesInvoiceDto?.userdate,
          type: createSalesInvoiceDto?.type === "reccuring" && "reccuring",
          incomeTax: element?.incomeTax,
          incomeTaxAmount: element?.incomeTaxAmount,
          vatamt: element?.incomeTaxAmount,
          vat: element?.incomeTax,
          includevat: element?.includevat ? 1 : 0,
          totalamount: element?.total,
          discount: element?.discount,
          description: element?.description,
          booleantype: "1",
          usertype: "customer",
          used: "group",
          invoiceno: createInvoice?.invoiceno,
          baseid: "",
          itemorder: element?.itemorder || index + 1,
          createdBy: createSalesInvoiceDto.createdBy,
          companyid: createSalesInvoiceDto.companyid,
          seriesNo: createSalesInvoiceDto.seriesNo,
          imei: element?.imei && element?.imei?.length ? element?.imei : [],
        };
        invoiceItems.push(saleItem);
      }
      return invoiceItems;
    } catch (error) {
      console.log(" === ==== ==== ===  helper error ->", error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
