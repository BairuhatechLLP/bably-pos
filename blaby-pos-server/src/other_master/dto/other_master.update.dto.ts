import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UpdateOtherMasterDto {
  @ApiProperty()
  @IsOptional()
  readonly type: string;

  @ApiProperty()
  @IsOptional()
  readonly adminId: number;

  @ApiProperty()
  @IsOptional()
  readonly companyId: number;

  @ApiProperty()
  @IsOptional()
  readonly total: number;

  @ApiProperty()
  @IsOptional()
  readonly cname?: number;

  @ApiProperty()
  @IsOptional()
  readonly ledgerId: number;

  @ApiProperty()
  @IsOptional()
  readonly bankid?: number;

  @ApiProperty()
  @IsOptional()
  readonly reference?: string;

  @ApiProperty()
  @IsOptional()
  readonly createdBy: number;

  @ApiProperty()
  @IsOptional()
  readonly date: Date;
}
