import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UserEmailUpdateDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly email: string;
  @ApiProperty()
  // @IsOptional()
  @IsNumber()
  readonly userId: string;
}

export class verifyEmailDto {
  @ApiProperty()
  readonly tokenId: string;
}
