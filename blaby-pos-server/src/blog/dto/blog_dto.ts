import { ApiProperty } from '@nestjs/swagger';
import { BlogMaster } from '../blog.entity';

export class BlogMasterDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly title: string;

  @ApiProperty()
  readonly image: string;

  @ApiProperty()
  readonly content: string;

  @ApiProperty()
  readonly category: string;
  
  @ApiProperty()
  readonly status: boolean; 

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;


  constructor(post: BlogMaster) {
    this.id = post.id;
    this.title = post.title;
    this.image = post.image;
    this.content = post.content;
    this.category = post.category;
    this.status = post.status;
    this.createdAt = post.createdAt;
    this.updatedAt = post.updatedAt;
  }
}
