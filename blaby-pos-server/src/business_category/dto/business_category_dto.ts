import { ApiProperty } from '@nestjs/swagger';
import { BusinessCategory } from '../business_category_entity';

export class BusinessCategoryDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly btitle: string;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiProperty()
  readonly status: number; 

  @ApiProperty()
  readonly adminid: number; 

  constructor(post: BusinessCategory) {
    this.id = post.id;
    this.btitle = post.btitle;
    this.createdAt = post.createdAt;
    this.updatedAt = post.updatedAt;
    this.status = post.status;
    this.adminid = this.adminid
  }
}
