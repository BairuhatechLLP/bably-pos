import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/user.entity';

import { SaleInvoice } from '../sale_invoice';

export class SalesInvoiceDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty() readonly cname: string;
  @ApiProperty() readonly inaddress: string;
  @ApiProperty() readonly deladdress: string;
  @ApiProperty() readonly userid: number;
  @ApiProperty() readonly customerid: number;
  @ApiProperty() readonly issued: string;
  @ApiProperty() readonly invoiceno: string;
  @ApiProperty() readonly type: string;
  @ApiProperty() readonly attachment: string;
  @ApiProperty() readonly quotes: string;
  @ApiProperty() readonly terms: string;
  @ApiProperty() readonly reference: string;
  @ApiProperty() readonly userdate: Date;
  @ApiProperty() readonly sdate: Date;
  @ApiProperty() readonly ldate: Date;
  @ApiProperty() readonly total: number;
  @ApiProperty() readonly outstanding: number;
  @ApiProperty() readonly status: number;
  @ApiProperty() readonly adminid: number;
  @ApiProperty() readonly share: number;
  @ApiProperty() readonly refid: number;
  @ApiProperty() readonly sales_ref: string;
  @ApiProperty() readonly roundOff: string;
  @ApiProperty() readonly usertype: string;
  @ApiProperty() readonly salesType: string;
  refInvoice: SaleInvoice;
  @ApiProperty() readonly salestock: number;
  @ApiProperty() readonly stockid: number;
  @ApiProperty() readonly taxable_value: number;
  @ApiProperty() readonly total_vat: number;
  @ApiProperty() readonly overall_discount: number;
  @ApiProperty() readonly createdBy: number;
  @ApiProperty() readonly companyid: number;
  @ApiProperty() readonly loyaltyDiscountAmount: number;
  @ApiProperty() readonly seriesNo: number;
  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiProperty()
  readonly user: User[];

  constructor(tmp: SaleInvoice) {
    this.id = tmp.id;
    this.cname = tmp.cname;
    this.inaddress = tmp.inaddress;
    this.deladdress = tmp.deladdress;
    this.userid = tmp.userid;
    this.customerid = tmp.customerid;
    this.issued = tmp.issued;
    this.invoiceno = tmp.invoiceno;
    this.type = tmp.type;
    this.attachment = tmp.attachment;
    this.quotes = tmp.quotes;
    this.terms = tmp.terms;
    this.reference = tmp.reference;

    this.userdate = tmp.userdate;
    this.sdate = tmp.sdate;
    this.ldate = tmp.ldate;
    this.total = tmp.total;
    this.outstanding = tmp.status === 10 ? 0 : tmp.outstanding;
    this.status = tmp.status;
    this.adminid = tmp.adminid;
    this.share = tmp.share;
    this.taxable_value = tmp.taxable_value;
    this.overall_discount = tmp.overall_discount;
    this.total_vat = tmp.total_vat;
    this.createdAt = tmp.created_at;
    this.updatedAt = tmp.updated_at;
    this.user = tmp.user;
    this.refid = tmp.refid;
    this.sales_ref = tmp.sales_ref;
    this.roundOff = tmp.roundOff;
    // this.refInvoice = tmp.refInvoice;
    this.salesType = tmp.salesType;
    this.salestock = tmp.salestock;
    this.stockid = tmp.stockid;
    this.createdBy = tmp.createdBy;
    this.usertype = tmp.usertype;
    this.loyaltyDiscountAmount = tmp.loyaltyDiscountAmount;
    this.seriesNo = tmp.seriesNo;
  }
}
