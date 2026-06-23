import { ApiProperty } from '@nestjs/swagger';

export class CreateHsnCodeDto {
  @ApiProperty()
  readonly hsn_code: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly adminid: number;

  @ApiProperty() 
  readonly companyid: number;

}
