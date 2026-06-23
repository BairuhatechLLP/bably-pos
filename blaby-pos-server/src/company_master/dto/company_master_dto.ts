import { ApiProperty } from "@nestjs/swagger";
import { CompanyMaster } from "../company_master_entity";
import { Countries } from "../../countries/countries_model";

export class CompanyMasterDto {
  @ApiProperty() readonly id: number;

  @ApiProperty() @ApiProperty() readonly status: number;
  @ApiProperty() @ApiProperty() readonly type: string;
  @ApiProperty() @ApiProperty() readonly expiretime: string;
  @ApiProperty() @ApiProperty() readonly bname: string;
  @ApiProperty() @ApiProperty() readonly btype: string;
  @ApiProperty() @ApiProperty() readonly registerno: string;
  @ApiProperty() @ApiProperty() readonly rtype: string;
  @ApiProperty() @ApiProperty() readonly rdate: Date;
  @ApiProperty() @ApiProperty() readonly expiredate: Date;
  @ApiProperty() @ApiProperty() readonly plan: string;
  @ApiProperty() @ApiProperty() readonly company: string;
  @ApiProperty() @ApiProperty() readonly address1: string;
  @ApiProperty() @ApiProperty() readonly address2: string;
  @ApiProperty() @ApiProperty() readonly city: string;
  @ApiProperty() @ApiProperty() readonly cemail: string;
  @ApiProperty() @ApiProperty() readonly cphoneno: string;
  @ApiProperty() @ApiProperty() readonly cperson: string;
  @ApiProperty() @ApiProperty() readonly taxregno: string;
  @ApiProperty() @ApiProperty() readonly tax: string;
  @ApiProperty() @ApiProperty() readonly taxno: string;
  @ApiProperty() @ApiProperty() readonly logo: string;
  @ApiProperty() @ApiProperty() readonly adminid: number;
  @ApiProperty() @ApiProperty() readonly userid: number;
  @ApiProperty() @ApiProperty() readonly bimage: string;
  @ApiProperty() @ApiProperty() readonly bcategory: string;
  @ApiProperty() @ApiProperty() readonly accounttype: string;
  @ApiProperty() @ApiProperty() readonly defaultmail: string;
  @ApiProperty() @ApiProperty() readonly defaultinvoice: string;
  @ApiProperty() @ApiProperty() readonly accplan: string;
  @ApiProperty() @ApiProperty() readonly cusNotes: string;
  @ApiProperty() @ApiProperty() readonly fulladdress: string;
  @ApiProperty() @ApiProperty() readonly website: string;
  @ApiProperty() @ApiProperty() readonly reporttype: number;
  @ApiProperty() @ApiProperty() readonly endYear: string;
  @ApiProperty() @ApiProperty() readonly books_begining_from: Date;
  @ApiProperty() @ApiProperty() readonly financial_year_start: Date;
  @ApiProperty() @ApiProperty() readonly defaultTerms: string;
  @ApiProperty() @ApiProperty() readonly stripeKey: string;
  @ApiProperty() @ApiProperty() readonly payStackKey: string;
  @ApiProperty() @ApiProperty() readonly country: number;
  @ApiProperty() readonly countryInfo: Countries;
  @ApiProperty() @ApiProperty() readonly state: string;
  @ApiProperty() readonly stripe_offline_link: string;
  @ApiProperty() @ApiProperty() readonly defaultMerchant: string;
  @ApiProperty() @ApiProperty() readonly defaultBank: number;
  @ApiProperty() readonly isOtherTerritory: boolean;
  @ApiProperty() readonly isEInvoice: boolean;
  @ApiProperty() readonly isEwayBill: boolean;

  @ApiProperty() readonly isUniformShifts: boolean;
  @ApiProperty() readonly workingTimeFrom: string;
  @ApiProperty() readonly workingTimeTo: string;
  
  @ApiProperty() readonly isLoyaltyEnabled: boolean;
  @ApiProperty() readonly loyaltyDiscountPercentage: number;
  @ApiProperty() readonly referralPoint: number;
  @ApiProperty() readonly loyaltyRedeemLimit: number;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  constructor(tmp: CompanyMaster) {
    this.id = tmp.id;
    this.status = tmp.status;
    this.type = tmp.type;
    this.expiretime = tmp.expiretime;
    this.bname = tmp.bname;
    this.btype = tmp.btype;
    this.registerno = tmp.registerno;
    this.rtype = tmp.rtype;
    this.rdate = tmp.rdate;
    this.expiredate = tmp.expiredate;
    this.plan = tmp.plan;
    this.company = tmp.company;
    this.address1 = tmp.address1;
    this.address2 = tmp.address2;
    this.city = tmp.city;
    this.cemail = tmp.cemail;
    this.cphoneno = tmp.cphoneno;
    this.cperson = tmp.cperson;
    this.taxregno = tmp.taxregno;
    this.tax = tmp.tax;
    this.taxno = tmp.taxno;
    this.logo = tmp.logo;
    this.adminid = tmp.adminid;
    this.bimage = tmp.bimage;
    this.bcategory = tmp.bcategory;
    this.accounttype = tmp.accounttype;
    this.defaultmail = tmp.defaultmail;
    this.defaultinvoice = tmp.defaultinvoice;
    this.accplan = tmp.accplan;
    this.cusNotes = tmp.cusNotes;
    this.fulladdress = tmp.fulladdress;
    this.website = tmp.website;
    this.reporttype = tmp.reporttype;
    this.endYear = tmp.endYear;
    this.financial_year_start = tmp.financial_year_start;
    this.books_begining_from = tmp.books_begining_from;
    this.defaultTerms = tmp.defaultTerms;
    this.stripeKey = tmp.stripeKey;
    this.payStackKey = tmp.payStackKey;
    this.defaultMerchant = tmp.defaultMerchant;
    this.defaultBank = tmp.defaultBank;
    this.isOtherTerritory = tmp.isOtherTerritory;
    this.isEInvoice = tmp.isEInvoice;
    this.isEwayBill = tmp.isEwayBill;
    this.stripe_offline_link = tmp.stripe_offline_link;
    this.country = tmp.country;
    this.countryInfo = tmp.countryInfo;
    this.workingTimeFrom = tmp.workingTimeFrom;
    this.workingTimeTo = tmp.workingTimeTo;
    this.isUniformShifts = tmp.isUniformShifts;
    this.isLoyaltyEnabled = tmp.isLoyaltyEnabled;
    this.loyaltyDiscountPercentage = tmp.loyaltyDiscountPercentage;
    this.referralPoint = tmp.referralPoint;
    this.loyaltyRedeemLimit = tmp.loyaltyRedeemLimit;
  }
}
