import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty()
  @IsString()
  readonly title: string;

  @ApiProperty()
  readonly image: string;

  @ApiProperty()
  @IsString()
  readonly content: string;

  @ApiProperty()
  readonly category: string;

  @ApiProperty() 
  readonly date: Date;

  @ApiProperty()
  readonly status: boolean;

}
