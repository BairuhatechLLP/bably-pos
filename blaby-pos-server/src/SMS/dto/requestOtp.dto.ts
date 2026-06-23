import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {

  @ApiProperty()
  readonly code: string;

  @ApiProperty()
  readonly phonenumber: string;
}
