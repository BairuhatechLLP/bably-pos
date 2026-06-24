import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkDeleteDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  ids: number[];
}
