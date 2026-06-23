import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MinLength
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty()
  @IsEmail()
  readonly email: string;
  
  @IsOptional()
  @ApiProperty()
  @IsString()
  @MinLength(6)
  readonly password: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly fullName: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly phonenumber: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly countryid: number;

  @ApiProperty()
  @IsOptional()
  readonly dob: Date;

  @ApiProperty()
  @IsOptional()
  readonly place: string;

  @ApiProperty()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsOptional()
  isTaxgo: boolean;

  @ApiProperty()
  @IsOptional()
  readonly image: string;

  @ApiProperty()
  @IsOptional()
  readonly city: string;

  @ApiProperty()
  @IsOptional()
  readonly affiliationCode: string;
}
