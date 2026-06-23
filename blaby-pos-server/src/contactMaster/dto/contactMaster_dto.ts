import { ApiProperty } from "@nestjs/swagger";
import { ContactMaster } from "../contactMasterModel";

export class ContactMasterDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty() readonly name: string;
  @ApiProperty() readonly bus_name: string;
  @ApiProperty() readonly email: string;
  @ApiProperty() readonly mobile: string;
  @ApiProperty() readonly telephone: string;
  @ApiProperty() readonly address: string;
  @ApiProperty() readonly city: string;
  @ApiProperty() readonly postcode: string;
  @ApiProperty() readonly acc_default: string;
  @ApiProperty() readonly notes: string;
  @ApiProperty() readonly reference: string;
  @ApiProperty() readonly userid: number;
  @ApiProperty() readonly adminid: number;
  @ApiProperty() readonly is_deleted: boolean;
  @ApiProperty() readonly userdate: Date;
  @ApiProperty() readonly active: boolean;
  @ApiProperty() readonly vat_number: string;
  @ApiProperty() readonly opening_balance: number;
  @ApiProperty() readonly contractors_type: string;
  @ApiProperty() readonly category: number;
  @ApiProperty() readonly password: string;
  @ApiProperty() readonly staffId: string;
  @ApiProperty() readonly image: string;
  @ApiProperty() readonly access: string;
  @ApiProperty() readonly country: string;
  @ApiProperty() readonly state: string;
  @ApiProperty() readonly createdBy: number;
  @ApiProperty() readonly companyid: number;

  @ApiProperty() readonly loyaltyCardNumber: string;
  @ApiProperty() readonly loyaltyPoints: number;
  @ApiProperty() readonly referralCount: number;
  @ApiProperty() readonly referralPoint: number;

  @ApiProperty()
  readonly createdat: Date;

  @ApiProperty()
  readonly updateat: Date;

  constructor(tmp: ContactMaster) {
    this.id = tmp.id;
    this.name = tmp.name;
    this.bus_name = tmp.bus_name;
    this.email = tmp.email;
    this.mobile = tmp.mobile;
    this.telephone = tmp.telephone;
    this.address = tmp.address;
    this.city = tmp.city;
    this.postcode = tmp.postcode;
    this.acc_default = tmp.acc_default;
    this.notes = tmp.notes;
    this.reference = tmp.reference;
    this.userid = tmp.userid;
    this.adminid = tmp.adminid;
    this.is_deleted = tmp.is_deleted;
    this.userdate = tmp.userdate;
    this.active = tmp.active;
    this.contractors_type = tmp.contractors_type;
    this.vat_number = tmp.vat_number;
    this.category = tmp.ledger_category;
    this.opening_balance = tmp.opening_balance;
    this.createdat = tmp.createdat;
    this.updateat = tmp.updatedat;
    this.staffId = tmp.staffId;
    this.password = tmp.password;
    this.image = tmp.image;
    this.access = tmp.access;
    this.country = tmp.country;
    this.state = tmp.state;
    this.createdBy = tmp.createdBy;
    this.companyid = tmp.companyid;
    this.loyaltyCardNumber = tmp.loyaltyCardNumber;
    this.loyaltyPoints = tmp.loyaltyPoints;
    this.referralCount = tmp.referralCount;
    this.referralPoint = tmp.referralPoint;
  }
}
