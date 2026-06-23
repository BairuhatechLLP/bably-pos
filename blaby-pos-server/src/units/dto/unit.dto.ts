import { ApiProperty } from '@nestjs/swagger';
import { unit } from '../unit.entity';

export class UnitDto {
  @ApiProperty()
  readonly id: number;
  @ApiProperty()
  readonly unit: string;
  @ApiProperty()
  readonly decimalValues: number;
  @ApiProperty()
  readonly adminId: number;
  @ApiProperty()
  readonly companyid: number;
  @ApiProperty()
  readonly formalName: string;
  @ApiProperty()
  readonly isDeleted: boolean;
  @ApiProperty()
  readonly createdAt: Date;
  @ApiProperty()
  readonly updatedAt: Date;
  constructor(temp: unit) {
    this.id = temp.id;
    this.unit = temp.unit;
    this.companyid = temp.companyid;
    this.decimalValues = temp.decimalValues;
    this.formalName = temp.formalName;
    this.isDeleted = temp.isDeleted;
    this.createdAt = temp.create_at;
    this.updatedAt = temp.updatedAt;
  }
}
