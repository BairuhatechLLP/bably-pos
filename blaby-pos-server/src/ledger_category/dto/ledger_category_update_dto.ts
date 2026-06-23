import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";
 
export class UpdateLedgerCategoryDto {

    @ApiProperty() @IsString() readonly category: string
    @ApiProperty() readonly adminid: number
    @ApiProperty() readonly categorygroup: string
    @ApiProperty() readonly categorygroupid: number
    @ApiProperty() readonly createdBy: number 
    @ApiProperty() readonly companyid: number 

}