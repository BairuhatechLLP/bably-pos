import { ApiProperty } from "@nestjs/swagger";
import { User } from "../user.entity";
import { UserDto } from "./user.dto";

export class UserLoginResponseDto extends UserDto {
  @ApiProperty()
  token: string;
  @ApiProperty()
  bankInfo: any;

  constructor(user: User, token?: string, bankInfo?: any) {
    super(user);
    this.token = token;
    this.bankInfo = bankInfo;
  }
}
