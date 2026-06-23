import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class PurchaseInvoiceHelperService {
  constructor() {}
  async createInvoiceLineItem(
    type: string,
    createInvoice: any,
    createDto: any,
  ) {
    let invoiceItems = [];

    try {
      let totalVat = 0;
      let ledgerAcc = createDto.ledger;
      let totalNet = 0;
      let uniqueVat = [];
      let index = 0;
      const lineItems = createDto.pList ? createDto.pList : createDto.columns;
      for (let i = 0; i < lineItems?.length; i++) {
        let element = lineItems[i];
        const costprice = element.costprice;
        const quantity = element.quantity;
        const totalamount = Number(costprice) * Number(quantity);
        const incomeTax = element.incomeTax;
        const incomeTaxAmount = Number(element?.vatamount);
        totalVat += incomeTaxAmount;
        totalNet += totalamount;
        uniqueVat.push(element.incomeTax);

        let purchaseData = {
          purchaseid: createInvoice.id,
          idescription: element.product.id,
          sdate: createDto.purchase.sdate,
          ldate: createDto.purchase.ldate,
          cname: createDto.supplier.id,
          ledger: ledgerAcc?.id,
          total: element.total,
          ledgercategory: ledgerAcc?.category,
          userid: createDto.userid,
          adminid: createDto.adminid,
          type:
            type == 'pinvoice' ? 'Purchase Invoice'  : type == 'stockassets' ? 'stockassets'  : type == 'order' ? "Purchase Order" : 'Purchase Credit Notes',
          incomeTax: element.incomeTax,
          incomeTaxAmount: element.incomeTaxAmount,
          vatamt: element.vatamt,
          vat: element.vat,
          includevat: element.includevat,
          description: element.description,
          booleantype: type == 'pinvoice' || type == 'stockassets' ? '2' : '25',
          usertype: 'supplier',
          used: 'group',
          costprice: element.costprice,
          quantity: element.quantity,
          productLocationRef:element.productLocationRef,
          discount_status: '0',
          invoiceno: createInvoice.invoiceno,
          discount: element.discount,
          percentage: element.percentage,
          userdate: createDto.userdate,
          itemorder: element.itemorder || index + 1,
          discount_amount:element.discountamt,
          invoiceid: createDto.invoiceid,
          createdBy:createDto.createdBy,
          companyid:createDto.companyid,
          seriesNo:createDto.seriesNo,
        };
        invoiceItems.push(purchaseData);
      }
    } catch (error) {
      console.log(error)
      //throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return invoiceItems;
  }
}
