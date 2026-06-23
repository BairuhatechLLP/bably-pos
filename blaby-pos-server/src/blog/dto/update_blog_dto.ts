import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateBlogDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly title: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly image: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly content: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly category: string;


  @IsOptional()
  @ApiProperty() 
  readonly date: Date;

  @IsOptional()
  @ApiProperty()
  readonly status: boolean;

  @IsOptional()
  @ApiProperty()
  readonly adminid: number;
}
