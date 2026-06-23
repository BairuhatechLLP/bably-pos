import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class verifyOtpDto {
  @ApiProperty()
  @IsString()
  readonly token: string;

  @ApiProperty()
  @IsString()
  readonly otp: string;

  
  @ApiProperty()
  @IsString()
  readonly code: string;

  @ApiProperty()
  @IsString()
  readonly phonenumber: string;
}

export class CreateOtpDto {
  @ApiProperty()
  @IsString()
  readonly phonenumber: string;

  @ApiProperty()
  @IsString()
  readonly isVerified: Boolean;
}