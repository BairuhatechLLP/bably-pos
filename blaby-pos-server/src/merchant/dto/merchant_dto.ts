import { ApiProperty } from '@nestjs/swagger';
import { Merchant } from '../merchant_entity';

export class MerchantDto {
  @ApiProperty()
  readonly id: number;
  @ApiProperty()
  readonly merchand_id: string;
  @ApiProperty()
  readonly account_type: string;
  @ApiProperty()
  readonly account_name: string;
  @ApiProperty()
  readonly private_key: string;
  @ApiProperty()
  readonly registered_id: string;
  @ApiProperty()
  readonly registered_name: string;
  @ApiProperty()
  readonly type: string;
  @ApiProperty()
  readonly user_id: number;
  @ApiProperty()
  readonly vendor_name: string;
  @ApiProperty()
  readonly pos_vendor_name: string;
  @ApiProperty()
  readonly device_id: string;
  @ApiProperty()
  readonly pos_registered_id: string;
  @ApiProperty()
  readonly pos_registered_name: string;
  @ApiProperty()
  readonly pos_business_name: string;

  constructor(merchant: Merchant) {
    this.id = merchant.id;
    this.merchand_id = merchant.merchand_id;
    this.account_type = merchant.account_type;
    this.account_name = merchant.account_name;
    this.private_key = merchant.private_key;
    this.registered_id = merchant.registered_id;
    this.registered_name = merchant.registered_name;
    this.type = merchant.type;
    this.user_id = merchant.user_id;
    this.vendor_name = merchant.vendor_name;
    this.pos_vendor_name = merchant.pos_vendor_name;
    this.device_id = merchant.device_id;
    this.pos_registered_id = merchant.pos_registered_id;
    this.pos_registered_name = merchant.pos_registered_name;
    this.pos_business_name = merchant.pos_business_name;
  }
}
