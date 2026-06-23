import { ApiProperty } from "@nestjs/swagger";
import { Affiliations } from "../affiliations-model";

export class AffiliationsDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly phone: string;

  @ApiProperty()
  readonly affiliationCode: string;

  @ApiProperty()
  readonly affiliationLink: string;

  @ApiProperty()
  readonly countryid: number;

  @ApiProperty()
  readonly noOfPersons: number;

  @ApiProperty()
  readonly image: string;

  @ApiProperty()
  readonly details: object;

  @ApiProperty()
  readonly amountEarned: number;

  @ApiProperty()
  readonly rewardPercentage: number;

  @ApiProperty()
  readonly createdat: Date;

  constructor(val: Affiliations) {
    this.id = val.id;
    this.name = val.name;
    this.email = val.email;
    this.phone = val.phone;
    this.affiliationCode = val.affiliationCode;
    this.affiliationLink = val.affiliationLink;
    this.noOfPersons = val.noOfPersons;
    this.details = val.details;
    this.image = val.image;
    this.amountEarned = val.amountEarned;
    this.rewardPercentage = val.rewardPercentage;
    this.countryid = val.countryid;
  }
}
