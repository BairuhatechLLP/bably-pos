import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Length,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDate,
} from 'class-validator';

export class UpdateProductMasterDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  readonly itemtype: string;
  @ApiProperty() @IsString() readonly icode: string;
  @ApiProperty() @IsString() readonly idescription: string;
  @ApiPropertyOptional() readonly variant_name: string;
  @ApiProperty() readonly spname: string;
  @ApiProperty() readonly ledgercategory: number;
  @ApiProperty() readonly svrate: string;
  @ApiProperty() readonly sicode: string;
  @ApiProperty() readonly pdescription: string;
  @ApiProperty() readonly pvrate: string;
  @ApiProperty() readonly paccount: number;
  @ApiProperty() readonly location: string;
  @ApiProperty() readonly barcode: string;
  @ApiProperty() readonly weight: string;
  @ApiProperty() readonly notes: string;
  @ApiProperty() readonly userid: number;
  @ApiProperty() readonly name: string;
  @ApiProperty() readonly ptype: string;
  @ApiProperty() readonly reason: string;
  @ApiProperty() readonly pimage: string;
  @ApiProperty() readonly qdate: Date;
  @ApiProperty() readonly date: Date;
  @ApiProperty() readonly expiredate: Date;
  @ApiProperty() readonly userdate: Date;
  @ApiProperty() readonly trade_price: number;
  @ApiProperty() readonly wholesale: number;
  @ApiProperty() readonly rate: number;
  @ApiProperty() readonly quantity: number;
  @ApiProperty() readonly qtype: number;
  @ApiProperty() readonly vatamt: number;
  @ApiProperty() readonly includevat: number;
  @ApiProperty() readonly price: number;
  @ApiProperty() readonly costprice: number;
  @ApiProperty() readonly rlevel: number;
  @ApiProperty() readonly rquantity: number;
  @ApiProperty() readonly sp_price: number;
  @ApiProperty() readonly stock: number;
  @ApiProperty() readonly cquantity: number;
  @ApiProperty() readonly c_price: number;
  @ApiProperty() readonly saccount: number;
  @ApiProperty() readonly increase: number;
  @ApiProperty() readonly decrease: number;
  @ApiProperty() readonly netquantity: number;
  @ApiProperty() readonly adminid: number;
  @ApiProperty() readonly vat: number;
  @ApiProperty() readonly product_category: number;//string;
  @ApiProperty() readonly unit: number;//string;
  @ApiProperty() readonly is_deleted: boolean;
  @ApiProperty() readonly createdBy: number;
  @ApiProperty() readonly companyid: number;
  @ApiProperty() readonly hsn_code: string;
  
  @ApiPropertyOptional() 
  @IsOptional()
  readonly taxable_amount: number;
}

export class UpdateStockDto {
  @ApiProperty() quantity: number;
  @ApiProperty() readonly stock: number;
}
