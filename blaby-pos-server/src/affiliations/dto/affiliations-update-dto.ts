import { ApiProperty } from "@nestjs/swagger";
import { IsJSON, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateAffiliationsDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly email?: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly phone?: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly affiliationCode?: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly affiliationLink: string;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly countryid: number;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly image: string;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly noOfPersons?: number;

  @IsOptional()
  @ApiProperty()
  @IsJSON()
  readonly details?: object;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly amountEarned?: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  readonly rewardPercentage?: number;
}
