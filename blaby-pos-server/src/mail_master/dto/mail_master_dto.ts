import { ApiProperty } from '@nestjs/swagger';
import { MailMaster } from '../mail_master_entity';

export class MailMasterDto {
  @ApiProperty()
  readonly id: number;
  @ApiProperty()
  readonly email: string;
  constructor(MailMaster: MailMaster) {
    this.id = MailMaster.id;
    this.email = MailMaster.email;
  }
}
