import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";
 
export class UpdateLedgerCategoryGroupDto {
    @IsOptional() @ApiProperty() @IsString() readonly categorygroup: string

}