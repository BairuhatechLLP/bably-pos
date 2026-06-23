import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateBusinessCategoryDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly btitle: string;

  @IsOptional()
  @ApiProperty()
  readonly status: number;

  @IsOptional()
  @ApiProperty()
  readonly adminid: number;
}
