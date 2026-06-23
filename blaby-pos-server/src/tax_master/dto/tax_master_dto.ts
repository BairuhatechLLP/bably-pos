import { ApiProperty } from '@nestjs/swagger';
import { Tax } from '../tax_master_entity';
import { Countries } from '../../countries/countries_model';

export class TaxDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly percentage: number;

  @ApiProperty()
  readonly countryid: Countries;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiProperty()  
  adminid: number;

  @ApiProperty()  
  companyid: number;

  constructor(tax: Tax) {
    this.id = tax.id;
    this.type = tax.type;
    this.percentage = tax.percentage;
    this.countryid = tax.country;
    this.createdAt = tax.createdAt;
    this.updatedAt = tax.updatedAt;
    this.adminid = tax.adminid;
    this.companyid = tax.companyid;
  }
}
