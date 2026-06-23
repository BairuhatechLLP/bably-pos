import { ApiProperty } from '@nestjs/swagger';
import { AccountMaster } from '../../account_master/account_master';
import { AccountMasterDto } from '../../account_master/dto/account_masrter_dto';
import { User } from '../../users/user.entity';
import { LedgerDetails } from '../ledger_details';

export class LedgerDetailsDto {
  @ApiProperty()
  readonly id: number;
  @ApiProperty() readonly baseid: string;
  @ApiProperty() readonly credit: number;
  @ApiProperty() readonly debit: number;
  @ApiProperty() readonly type: string;
  @ApiProperty() readonly bankid: string;
  @ApiProperty() readonly ledger: number;
  @ApiProperty() readonly ledgercategory: number;
  @ApiProperty() readonly saleid: number;
  @ApiProperty() readonly purchaseid: number;
  @ApiProperty() readonly journalid: string;
  @ApiProperty() readonly invoiceid: string;
  @ApiProperty() readonly receiptid: string;
  @ApiProperty() readonly otherid: string;
  @ApiProperty() readonly userid: number;
  @ApiProperty() readonly adminid: number;
  @ApiProperty() readonly total: number;
  @ApiProperty() readonly invoiceno: string;
  @ApiProperty() readonly userdate: string;
  @ApiProperty() readonly cname: string;
  @ApiProperty() readonly customer_name: string;
  @ApiProperty() readonly idescription: string;
  @ApiProperty() readonly sdate: string;
  @ApiProperty() readonly ldate: Date;
  @ApiProperty() readonly totalamount: number;
  @ApiProperty() readonly outstanding: number;
  @ApiProperty() readonly status: string;
  @ApiProperty() readonly discount_status: number;
  @ApiProperty() readonly reference: string;
  @ApiProperty() readonly usedamount: number;
  @ApiProperty() readonly transferid: string;
  @ApiProperty() readonly paidmethod: string;
  @ApiProperty() readonly amount: number;
  @ApiProperty() readonly paidfrom: string;
  @ApiProperty() readonly details: string;
  @ApiProperty() readonly checked: number;
  @ApiProperty() readonly discount: number;
  @ApiProperty() readonly incomeTax: number;
  @ApiProperty() readonly description: string;
  @ApiProperty() readonly referenceid: string;
  @ApiProperty() readonly reconcile_status: number;
  @ApiProperty() readonly reconcileid: number;
  @ApiProperty() readonly reconcile_date: string;
  @ApiProperty() readonly used: string;
  @ApiProperty() readonly booleantype: number;
  @ApiProperty() readonly usertype: string;
  @ApiProperty() readonly costprice: number;
  @ApiProperty() readonly quantity: number;
  @ApiProperty() readonly percentage: number;
  @ApiProperty() readonly incomeTaxAmount: number;
  @ApiProperty() readonly priceType: string;
  @ApiProperty() readonly invoiceimage: string;
  @ApiProperty() readonly invoicedoc: string;
  @ApiProperty() readonly vat: number;
  @ApiProperty() readonly vatamt: number;
  @ApiProperty() readonly totalamt: number;
  @ApiProperty() readonly includevat: number;
  @ApiProperty() readonly showVat: number;
  @ApiProperty() readonly itemorder: number;
  @ApiProperty() readonly running_total: number;
  @ApiProperty() readonly payrollid: number;
  @ApiProperty() readonly employeeid: number;
  @ApiProperty() readonly createdBy: number;
  @ApiProperty() readonly companyid: number;
  @ApiProperty() readonly stockTransferId: number;
  @ApiProperty() readonly seriesNo: number;
  @ApiProperty() ledgerDetails: AccountMaster;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiProperty()
  readonly user: User[];

  constructor(tmp: LedgerDetails) {
    this.id = tmp.id;
    this.baseid = tmp.baseid;
    this.credit = tmp.credit;
    this.debit = tmp.debit;
    this.type = tmp.type;
    this.bankid = tmp.bankid;
    this.ledger = tmp.ledger;
    this.ledgercategory = tmp.ledgercategory;
    this.saleid = tmp.saleid;
    this.purchaseid = tmp.purchaseid;
    this.journalid = tmp.journalid;
    this.invoiceid = tmp.invoiceid;
    this.receiptid = tmp.receiptid;
    this.otherid = tmp.otherid;
    this.userid = tmp.userid;
    this.adminid = tmp.adminid;
    this.total = tmp.total;
    this.invoiceno = tmp.invoiceno;
    this.userdate = tmp.userdate;
    this.cname = tmp.cname;
    this.customer_name = tmp.customer_name;
    this.idescription = tmp.idescription;
    this.sdate = tmp.sdate;
    this.ldate = tmp.ldate;
    this.totalamount = tmp.totalamount;
    this.outstanding = tmp.outstanding;
    this.status = tmp.status;
    this.discount_status = tmp.discount_status;
    this.reference = tmp.reference;
    this.usedamount = tmp.usedamount;
    this.transferid = tmp.transferid;
    this.paidmethod = tmp.paidmethod;
    this.amount = tmp.amount;
    this.paidfrom = tmp.paidfrom;
    this.details = tmp.details;
    this.checked = tmp.checked;
    this.discount = tmp.discount;
    this.incomeTax = tmp.incomeTax;
    this.description = tmp.description;
    this.referenceid = tmp.referenceid;
    this.reconcile_status = tmp.reconcile_status;
    this.reconcileid = tmp.reconcileid;
    this.reconcile_date = tmp.reconcile_date;
    this.used = tmp.used;
    this.booleantype = tmp.booleantype;
    this.usertype = tmp.usertype;
    this.costprice = tmp.costprice;
    this.quantity = tmp.quantity;
    this.percentage = tmp.percentage;
    this.incomeTaxAmount = tmp.incomeTaxAmount;
    this.priceType = tmp.priceType;
    this.invoiceimage = tmp.invoiceimage;
    this.invoicedoc = tmp.invoicedoc;
    this.vat = tmp.vat;
    this.vatamt = tmp.vatamt;
    this.totalamt = tmp.totalamt;
    this.includevat = tmp.includevat;
    this.showVat = tmp.showVat;
    this.itemorder = tmp.itemorder;
    this.ledgerDetails = tmp.ledgerDetails;
    this.running_total = tmp.running_total;

    this.createdAt = tmp.created_at;
    this.updatedAt = tmp.updated_at;
    this.user = tmp.user;
    this.createdBy = tmp.createdBy;
    this.companyid = tmp.companyid;

    this.payrollid=tmp.payrollid;
    this.employeeid=tmp.employeeid;
    
    this.seriesNo=tmp.seriesNo;
  }
}
