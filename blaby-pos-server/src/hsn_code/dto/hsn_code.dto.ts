import { ApiProperty } from '@nestjs/swagger';
import { HsnCode } from '../hsn_code.entity';

export class HsnCodeDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly hsn_code: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly adminid: number;

  @ApiProperty()
  readonly companyid: number;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;


  constructor(code: HsnCode) {
    this.id = code.id;
    this.hsn_code = code.hsn_code;
    this.description = code.description;
    this.createdAt = code.createdAt;
    this.updatedAt = code.updatedAt;
  }
}
