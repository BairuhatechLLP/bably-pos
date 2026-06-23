import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserPhoneUpdateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly phonenumber: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly country_code: string;
}
