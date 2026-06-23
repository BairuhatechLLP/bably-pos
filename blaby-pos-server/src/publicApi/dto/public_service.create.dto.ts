import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class CreatePublicServiceCreateDto {
  @ApiProperty()
  readonly icode: string;

  @ApiProperty()
  readonly idescription: string;

  @ApiProperty()
  readonly sp_price: number;

  @ApiProperty()
  readonly rate: number;

  @ApiProperty()
  readonly product_category: number;

  @ApiProperty()
  readonly bankid?: number;

  @ApiProperty()
  readonly itemtype: string;

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly price: number;

  @ApiProperty()
  readonly includevat: number;

  @ApiProperty() readonly hsn_code?: string;

  @ApiProperty() @IsBoolean() readonly existingstock: boolean;

  @ApiProperty() readonly saccount?: number;

  @ApiProperty()
  readonly vat: number;

  @ApiProperty()
  readonly vatamt: number;

  @ApiProperty()
  readonly date: Date;

  @ApiProperty()
  readonly userid: number;

  @ApiProperty()
  readonly adminid: number;

  @ApiProperty()
  readonly createdBy: number;
}
