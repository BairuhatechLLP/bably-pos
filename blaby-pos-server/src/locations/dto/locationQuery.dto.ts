import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class LocationListAllQueryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  readonly searchLocaton?: string;
}
