import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
export class ListAccountMasterDto {
  @ApiProperty()
  @IsOptional()
  readonly sDate: string;
  @ApiProperty()
  @IsOptional()
  readonly lDate: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly query: string;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly page: number;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly take: number;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly adminId: number;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly companyId: number;
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly accountname: string;
}
