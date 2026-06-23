import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean,  IsDate,  IsNumber,   IsString ,IsOptional} from "class-validator";

export class CreateLedgerCategoryGroupDto {
    @ApiProperty() @IsString() readonly categorygroup: string 
}