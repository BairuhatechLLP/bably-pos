import { ApiProperty } from "@nestjs/swagger";
import { IsString} from "class-validator";

export class CreateLedgerCategoryDto {
    @ApiProperty() @IsString() readonly category: string
    @ApiProperty() readonly adminid: number
    @ApiProperty() readonly categorygroup: string
    @ApiProperty() readonly categorygroupid: number 
    @ApiProperty() readonly createdBy: number
    @ApiProperty() readonly companyid: number  
    
}