import { ApiProperty } from "@nestjs/swagger";
import { User } from "../user.entity";
import { UserDto } from "./user.dto";

export class UserUpdateProfileResponseDtoo extends UserDto {
  @ApiProperty()
  companyInfo: any;

  constructor(user: User, companyinfo?: any) {
    super(user);
    this.companyInfo = companyinfo;
  }
}
