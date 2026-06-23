import { ApiProperty } from "@nestjs/swagger";

export class CreateAffiliationsDto {
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
  readonly amountEarned?: number;

  @ApiProperty()
  readonly rewardPercentage: number;

  @ApiProperty()
  readonly image: string;
}
