import { ApiProperty } from '@nestjs/swagger';
import {LedgerCategoryGroup  } from '../ledger_category_group_model';


export class LedgerCategoryGroupDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty() readonly categorygroup: string;


  @ApiProperty()
  readonly createdat: Date;

  @ApiProperty()
  readonly updateat: Date;

  constructor(tmp: LedgerCategoryGroup) {
    this.id = tmp.id;
    this.categorygroup = tmp.categorygroup;
    this.createdat = tmp.createdat;
    this.updateat = tmp.updatedAt
  }
}
