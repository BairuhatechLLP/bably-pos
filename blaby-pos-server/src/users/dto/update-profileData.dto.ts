import { ApiProperty } from "@nestjs/swagger";
import { User } from "../user.entity";
import { UserDto } from "./user.dto";

export class UserUpdateProfileResponseDto extends UserDto {
  @ApiProperty()
  companyInfo: any;
  @ApiProperty()
  companyid: any;
  @ApiProperty()
  token: string;
  @ApiProperty()
  bankInfo: any;

  constructor(user: User, companyinfo?: any, token?: string, bankInfo?: any) {
    super(user);
    this.companyid = companyinfo.id;
    this.companyInfo = companyinfo;
    this.token = token;
    this.bankInfo = bankInfo;
  }
}
