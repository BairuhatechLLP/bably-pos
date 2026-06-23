import { ApiProperty } from "@nestjs/swagger";

export class signup_Register {
  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly password: string;

  @ApiProperty()
  readonly fullName: string;

  @ApiProperty()
  readonly phonenumber: string;

  @ApiProperty()
  readonly status: number;

  @ApiProperty()
  readonly countryid: number;

  @ApiProperty()
  readonly dob: Date;

  @ApiProperty()
  readonly place: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  readonly image: string;

  @ApiProperty()
  readonly city: string;

  @ApiProperty()
  readonly mobileverified: number;

  @ApiProperty()
  readonly isAffiliateCodeUsed: boolean;
}
