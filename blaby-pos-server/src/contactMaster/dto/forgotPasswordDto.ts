import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class StaffForgotPasswordDto {
  token(token: any, privateKey: string) {
    throw new Error("Method not implemented.");
  }
  @ApiProperty()
  @IsEmail()
  readonly email: string;
}

export class StaffChangePasswordDto {
  @ApiProperty()
  readonly password: string;
  @ApiProperty()
  readonly token: string;
}
export class StaffChangePasswordOtpDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;
}

export class StaffChangePasswordOtpVerifyDto {
  @ApiProperty()
  @IsString()
  readonly token: string;

  @ApiProperty()
  @IsString()
  readonly otp: string;
}
