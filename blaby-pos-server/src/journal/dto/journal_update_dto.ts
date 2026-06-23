import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";
 
export class UpdateJournalDto {

    @ApiProperty() @IsString() readonly reference: string
    @ApiProperty() @IsString() readonly description: string
    @ApiProperty() @IsNumber() readonly total: number
    @ApiProperty() @IsNumber() readonly userid : number
    @ApiProperty() @IsNumber() readonly adminid : number
    @ApiProperty() @IsNumber() readonly createdBy : number
    @ApiProperty() @IsNumber() readonly companyid : number
    @ApiProperty() readonly userdate : Date

    constructor(tmp: UpdateJournalDto) {
        this.reference = tmp.reference;
        this.description = tmp.description;
        this.total = tmp.total;
        this.userid = tmp.userid;
        this.adminid = tmp.adminid;
        this.userdate = tmp.userdate;
        this.createdBy = tmp.createdBy;
        this.companyid = tmp.companyid
    }

}