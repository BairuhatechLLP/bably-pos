import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  token(token: any, privateKey: string) {
    throw new Error('Method not implemented.');
  }
  @ApiProperty()
  @IsEmail()
  readonly email: string;
}

export class newpasswordPasswordDto {
  @ApiProperty()
  readonly password: string;
  @ApiProperty()
  readonly token: string;
}
