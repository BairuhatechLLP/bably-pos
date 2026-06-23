import { ApiProperty } from "@nestjs/swagger";
import { RetailCustomerEntity } from "../retail_customer_entity";

export class RetailCustomerDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly adminid: number;
  @ApiProperty()
  readonly companyid: number;
  @ApiProperty()
  readonly outstanding: number;
  @ApiProperty()
  readonly phonenumber: string;
  @ApiProperty()
  readonly card_number: string;
  @ApiProperty()
  readonly email: string;
  @ApiProperty()
  readonly name: string;
  @ApiProperty()
  readonly status: number;
  @ApiProperty()
  readonly refferalId: number;
  @ApiProperty()
  readonly refferalPoint: number;
  @ApiProperty()
  readonly loyaltyPoint: number;
  @ApiProperty()
  readonly createdAt: Date;
  @ApiProperty()
  readonly updatedAt: Date;

  constructor(tmp: RetailCustomerEntity) {
    (this.id = tmp.id),
      (this.adminid = tmp.adminid),
      (this.companyid = tmp.companyid),
      (this.outstanding = tmp.outstanding),
      (this.phonenumber = tmp.phonenumber),
      (this.card_number = tmp.card_number),
      (this.email = tmp.email),
      (this.name = tmp.name),
      (this.status = tmp.status),
      (this.refferalId = tmp.refferalId),
      (this.refferalPoint = tmp.refferalPoint),
      (this.loyaltyPoint = tmp.loyaltyPoint),
      (this.createdAt = tmp.createdAt),
      (this.updatedAt = tmp.updatedAt);
  }
}
