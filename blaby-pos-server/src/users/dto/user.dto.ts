import { ApiProperty } from "@nestjs/swagger";
import { CompanyMaster } from "../../company_master/company_master_entity";
import { Countries } from "../../countries/countries_model";
import { User } from "../user.entity";

export class UserDto {
  @ApiProperty() readonly id: number;
  @ApiProperty() readonly email: string;
  @ApiProperty() readonly password: string;
  @ApiProperty() readonly fullName: string;
  @ApiProperty() readonly phonenumber: string;
  @ApiProperty() readonly countryid: number;
  @ApiProperty() readonly countryInfo: Countries;
  @ApiProperty() readonly dob: Date;
  @ApiProperty() readonly isTaxgo: boolean;
  @ApiProperty() readonly companyInfo: CompanyMaster;
  @ApiProperty() readonly mobileverified: number;
  @ApiProperty() readonly emailverified: number;
  @ApiProperty() readonly image: string;
  @ApiProperty() readonly address: string;
  @ApiProperty() readonly city: string;
  @ApiProperty() readonly created_at: Date;
  @ApiProperty() readonly affiliationCode: string;
  @ApiProperty() readonly isAffiliateCodeUsed: boolean;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.fullName = user.fullName;
    this.password = user.password;
    this.phonenumber = user.phonenumber;
    this.countryid = user.countryid;
    this.isTaxgo = user.isTaxgo;
    this.dob = user.dob;
    this.countryInfo = user.countryInfo;
    this.created_at = user.createdAt;
    this.mobileverified = user.mobileverified;
    this.emailverified = user.emailverified;
    this.image = user.image;
    this.address = user.address;
    this.city = user.city;
    this.affiliationCode = user.affiliationCode;
    this.isAffiliateCodeUsed = user.isAffiliateCodeUsed;
  }
}
