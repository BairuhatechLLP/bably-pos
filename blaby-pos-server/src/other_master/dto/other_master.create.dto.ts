import { ApiProperty } from "@nestjs/swagger";

export class CreateOtherMasterDto {

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly adminId: number;

  @ApiProperty()
  readonly companyId: number;

  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly cname?: number;
  
  @ApiProperty()
  readonly ledgerId: number;

  @ApiProperty()
  readonly bankid?: number;

  @ApiProperty()
  readonly reference?: string;

  @ApiProperty()
  readonly createdBy: number;

  @ApiProperty()
  readonly date: Date;
}
