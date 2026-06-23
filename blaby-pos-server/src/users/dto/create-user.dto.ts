import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  readonly password: string;

  @ApiProperty()
  @IsString()
  readonly fullName: string;

  @ApiProperty()
  @IsString()
  readonly phonenumber: string;

  @ApiProperty()
  @IsString()
  readonly image: string;

  @ApiProperty()
  @IsString()
  readonly city: string;

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
  readonly mobileverified: number;

  @ApiProperty()
  @IsOptional()
  readonly affiliationCode: string;

}
