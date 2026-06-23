import { ApiProperty } from '@nestjs/swagger';
import { Journal } from '../journal_model';
import { User } from '../../users/user.entity';

export class JournalDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty() readonly reference: string;
  @ApiProperty() readonly description: string;
  @ApiProperty() readonly total: number;
  @ApiProperty() readonly userid: User;
  @ApiProperty() readonly adminid: number;
  @ApiProperty() readonly userdate: Date;
  @ApiProperty() readonly createdBy: number;
  @ApiProperty() readonly companyid: number;

  @ApiProperty()
  readonly createdat: Date;

  @ApiProperty()
  readonly updateat: Date;

  constructor(tmp: Journal) {
    this.id = tmp.id;
    this.reference = tmp.reference;
    this.description = tmp.description;
    this.total = tmp.total;
    this.userid = tmp.user;
    this.adminid = tmp.adminid;
    this.userdate = tmp.userdate;
    this.createdat = tmp.createdat;
    this.updateat = tmp.updatedat;
    this.createdBy = tmp.createdBy;
    this.companyid = tmp.companyid
  }
}
