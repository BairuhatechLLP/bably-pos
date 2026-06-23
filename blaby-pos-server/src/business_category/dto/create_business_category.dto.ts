import { ApiProperty } from '@nestjs/swagger';
import { Length, IsString } from 'class-validator';

export class CreateBusinessCategoryDto {
  @ApiProperty()
  @IsString()
  readonly btitle: string;

  @ApiProperty()
  readonly status: number;

  @ApiProperty()
  readonly adminid: number;
}
