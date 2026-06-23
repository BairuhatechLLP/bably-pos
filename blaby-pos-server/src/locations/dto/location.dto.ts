import { ApiProperty } from '@nestjs/swagger';
import { LocationMaster } from '../location.entity';

export class LocationDto {
  @ApiProperty()
  readonly id: number;
  @ApiProperty()
  readonly location: string;
  @ApiProperty()
  readonly locationCode: string;
  @ApiProperty()
  readonly adminId: number;
  @ApiProperty()
  readonly companyid: number;
  @ApiProperty()
  readonly isDeleted: boolean;
  @ApiProperty()
  readonly createdAt: Date;
  @ApiProperty()
  readonly updatedAt: Date;
  constructor(temp: LocationMaster) {
    this.id = temp.id;
    this.location = temp.location;
    this.adminId = temp.adminId;
    this.companyid = temp.companyid;
    this.locationCode = temp.locationCode;
    this.isDeleted = temp.isDeleted;
    this.createdAt = temp.create_at;
    this.updatedAt = temp.updatedAt;
  }
}
