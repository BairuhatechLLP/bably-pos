import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/user.entity';
import { AccountMaster } from '../account_master';

export class AccountMasterDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty() readonly userid: number;

  @ApiProperty() readonly nominalcode: string;
  @ApiProperty() readonly laccount: string;
  @ApiProperty() readonly acctype: string;

  @ApiProperty() readonly accnum: string;
  @ApiProperty() readonly cardnum: string;
  @ApiProperty() readonly paidmethod: string;
  @ApiProperty() readonly sortcode1: string;
  @ApiProperty() readonly sortcode2: string;
  @ApiProperty() readonly sortcode3: string;
  @ApiProperty() readonly ibannum: string;
  @ApiProperty() readonly bicnum: string;
  @ApiProperty() readonly userdate: Date;
  @ApiProperty() readonly adminid: number;
  @ApiProperty() readonly opening: number;
  @ApiProperty() readonly total: number;
  @ApiProperty() readonly type: number;
  @ApiProperty() readonly category: number;
  @ApiProperty() readonly categorygroup: number;
  @ApiProperty() readonly visiblestatus: number;
  @ApiProperty() readonly visbank: number;
  @ApiProperty() readonly vissinvoice: number;
  @ApiProperty() readonly vispinvoice: number;
  @ApiProperty() readonly visotherreceipt: number;
  @ApiProperty() readonly visotherpayment: number;
  @ApiProperty() readonly visjournal: number;
  @ApiProperty() readonly visreport: number;
  @ApiProperty() readonly vispayroll: number;
  @ApiProperty() readonly showVatRate: number;

  @ApiProperty() readonly payheadType: string;
  @ApiProperty() readonly journals: string;
  @ApiProperty() readonly purchase: string;
  @ApiProperty() readonly sales: string;
  @ApiProperty() readonly calculationPeriod: number;
  @ApiProperty() readonly createdBy: number;
  @ApiProperty() readonly companyid: number;

  @ApiProperty() readonly branch: string;
  @ApiProperty() readonly ifsc: string;
  @ApiProperty() readonly accountname: string;


  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiProperty()
  readonly user: User;

  constructor(tmp: AccountMaster) {
    this.id = tmp.id;
    this.userid = tmp.userid;

    this.nominalcode = tmp.nominalcode;
    this.laccount = tmp.laccount;
    this.category = tmp.category;
    this.categorygroup = tmp.categorygroup;
    this.acctype = tmp.acctype;
    this.userid = tmp.userid;
    this.accnum = tmp.accnum;
    this.cardnum = tmp.cardnum;
    this.paidmethod = tmp.paidmethod;
    this.sortcode1 = tmp.sortcode1;
    this.sortcode2 = tmp.sortcode2;
    this.sortcode3 = tmp.sortcode3;
    this.ibannum = tmp.ibannum;
    this.bicnum = tmp.bicnum;
    this.opening = tmp.opening;
    this.total = tmp.total;
    this.userdate = tmp.userdate;
    this.type = tmp.type;
    this.adminid = tmp.adminid;
    this.visiblestatus = tmp.visiblestatus;
    this.visbank = tmp.visbank;
    this.vissinvoice = tmp.vissinvoice;
    this.vispinvoice = tmp.vispinvoice;
    this.visotherreceipt = tmp.visotherreceipt;
    this.visotherpayment = tmp.visotherpayment;
    this.visjournal = tmp.visjournal;
    this.visreport = tmp.visreport;
    this.showVatRate = tmp.showVatRate;
    this.payheadType = tmp.payheadType;
    this.calculationPeriod = tmp.calculationPeriod;

    this.journals = tmp.journals;
    this.purchase = tmp.Purchase;
    this.sales = tmp.Sales;

    this.createdAt = tmp.created_at;
    this.updatedAt = tmp.updated_at;
    this.user = tmp.users;

    this.branch = tmp.branch;
    this.ifsc = tmp.ifsc;
    this.companyid = tmp.companyid;
    this.accountname = tmp.accountname;
  }
}
