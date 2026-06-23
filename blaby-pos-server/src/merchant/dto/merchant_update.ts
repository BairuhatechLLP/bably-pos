import { ApiProperty } from '@nestjs/swagger';
export class UpdateMerchantDto {
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
}
