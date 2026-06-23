import { ApiProperty } from "@nestjs/swagger";
import { PurchaseInvoice } from "../purchase_invoice_model";
import { User } from "../../users/user.entity";

export class PurchaseInvoiceDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty() readonly userid: User;
  @ApiProperty() readonly supplierid: number;
  @ApiProperty() readonly quantity: number;
  @ApiProperty() readonly stockid: number;
  @ApiProperty() readonly invoiceno: string;
  @ApiProperty() readonly total: number;
  @ApiProperty() readonly outstanding: number;
  @ApiProperty() readonly sname: string;
  @ApiProperty() readonly status: number;
  @ApiProperty() readonly type: string;

  @ApiProperty() readonly adminid: number;

  @ApiProperty() readonly invoiceimage: Buffer;
  @ApiProperty() readonly invoicedoc: Buffer;
  @ApiProperty() readonly quotes: string;
  @ApiProperty() readonly usertype: string;
  @ApiProperty() readonly share: number;
  @ApiProperty() readonly taxable_value: number;
  @ApiProperty() readonly total_vat: number;
  @ApiProperty() readonly overall_discount: number;

  @ApiProperty() readonly createdBy: number;
  @ApiProperty() readonly companyid: number;
  @ApiProperty() readonly seriesNo: number;
  @ApiProperty() readonly supplier: any;

  @ApiProperty()
  readonly sdate: Date;

  @ApiProperty()
  readonly ldate: Date;

  @ApiProperty()
  readonly userdate: Date;

  @ApiProperty()
  readonly createdat: Date;

  @ApiProperty()
  readonly updatedat: Date;

  @ApiProperty() readonly refid: number;

  @ApiProperty() readonly purchase_ref: string;

  constructor(tmp: PurchaseInvoice) {
    this.id = tmp.id;
    this.userid = tmp.user;
    this.supplierid = tmp.supplierid;
    this.quantity = tmp.quantity;
    this.stockid = tmp.stockid;
    this.invoiceno = tmp.invoiceno;
    this.sdate = tmp.sdate;
    this.ldate = tmp.ldate;
    this.total = tmp.total;
    this.outstanding = tmp.status === 10 ? 0 : tmp.outstanding;
    this.sname = tmp.sname;
    this.status = tmp.status;
    this.type = tmp.type;
    this.adminid = tmp.adminid;
    this.userdate = tmp.userdate;
    this.invoiceimage = tmp.invoiceimage;
    this.invoicedoc = tmp.invoicedoc;
    this.supplier = tmp.supplier;
    this.quotes = tmp.quotes;
    this.share = tmp.share;
    this.createdat = tmp.createdat;
    this.updatedat = tmp.updatedat;
    this.taxable_value = tmp.taxable_value;
    this.overall_discount = tmp.overall_discount;
    this.total_vat = tmp.total_vat;
    this.refid = tmp.refid;
    this.createdBy = tmp.createdBy;
    this.companyid = tmp.companyid;
    this.purchase_ref = tmp.purchase_ref;
    this.usertype = tmp.usertype;
    this.seriesNo = tmp.seriesNo;
  }
}
