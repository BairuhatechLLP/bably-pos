import { ApiProperty } from "@nestjs/swagger";
import { OtherMaster } from "../other_master.entity";

export class OtherMasterDto {

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly adminId: number;

  @ApiProperty()
  readonly companyId: number;

  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly cname: number;

  @ApiProperty()
  readonly ledgerId: number;

  @ApiProperty()
  readonly bankid: number;

  @ApiProperty()
  readonly reference: string;

  @ApiProperty()
  readonly createdBy: number;

  @ApiProperty()
  readonly date: Date;

  constructor(otherMaster: OtherMaster) {
    this.type = otherMaster.type;
    this.adminId = otherMaster.adminId;
    this.companyId = otherMaster.companyId;
    this.total = otherMaster.total;
    this.cname = otherMaster.cname;
    this.ledgerId = otherMaster.ledgerId;
    this.bankid = otherMaster.bankid;
    this.reference = otherMaster.reference;
    this.createdBy = otherMaster.createdBy;
    this.date = otherMaster.date;
  }
}
