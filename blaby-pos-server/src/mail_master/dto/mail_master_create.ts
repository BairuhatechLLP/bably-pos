import { ApiProperty } from '@nestjs/swagger';
import { Length, IsString, IsNumber, IsDate } from 'class-validator';

export class CreateMailMasterDto {
  
  
  @ApiProperty()
  @IsString()
  readonly email: string;

}