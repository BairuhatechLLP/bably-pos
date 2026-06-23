import { User } from '../user.entity';
export class UserFullDTO {
  id: number;
  countryid?: number;
  countryInfo: any;
  fullName?: string;
  email: string;
  password: string;
  phonenumber?: string;
  dob: Date;
  isTaxgo?: boolean;
  verifycode?: string;
  emailverified?: number;
  mobileverified?: number;
  createdAt: Date;
  constructor(user: User) {
    this.id = user.id;
    this.countryid = user.countryid;
    this.countryInfo = user.countryInfo ? user.countryInfo : null;
    this.fullName = user.fullName;
    this.email = user.email;
    this.password = user.password;
    this.phonenumber = user.phonenumber;
    this.dob = user.dob;
    this.isTaxgo = user.isTaxgo;
    this.verifycode = user.verifycode;
    this.emailverified = user.emailverified;
    this.mobileverified = user.mobileverified;
    this.createdAt = user.createdAt;
  }
}