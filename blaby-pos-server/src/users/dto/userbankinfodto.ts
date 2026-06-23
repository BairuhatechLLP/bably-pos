import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.entity';
import { UserDto } from './user.dto';

export class UserBankInfodto extends UserDto {
  @ApiProperty()
  bankInfo: any;

  constructor(user: User, bankInfo?: any) {
    super(user);
    this.bankInfo = bankInfo;
  }
}
