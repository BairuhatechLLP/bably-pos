import { ApiProperty } from '@nestjs/swagger';
import { LedgerCategory } from '../ledger_category_model';


export class LedgerCategoryDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty() readonly category: string;
  @ApiProperty() readonly categorygroup: number;
  @ApiProperty() readonly createdBy: number 
  @ApiProperty() readonly companyid: number

  @ApiProperty()
  readonly createdat: Date;

  @ApiProperty()
  readonly updateat: Date;

  constructor(tmp: LedgerCategory) {
    this.id = tmp.id;
    this.category = tmp.category;
    this.categorygroup = tmp.categorygroup;
    this.createdat = tmp.createdat;
    this.updateat = tmp.updatedat;
    this.createdBy = tmp.createdBy;
    this.companyid = tmp.companyid;
  }
}
